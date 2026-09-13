import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Photographer from "@/models/Photographer";
import Reservation from "@/models/Reservation";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid reservation ID",
        },
        { status: 400 }
      );
    }

    const { status } = await request.json();

    const allowedStatuses = [
      "accepted",
      "rejected",
      "completed",
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid reservation status",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return NextResponse.json(
        {
          success: false,
          message: "Reservation not found",
        },
        { status: 404 }
      );
    }

    // Only the photographer assigned to this reservation
    // can change its status.
    if (user.role !== "photographer") {
      return NextResponse.json(
        {
          success: false,
          message: "Only photographers can update reservations",
        },
        { status: 403 }
      );
    }

    const photographerProfile = await Photographer.findOne({
      userId: user._id,
    });

    if (!photographerProfile) {
      return NextResponse.json(
        {
          success: false,
          message: "Photographer profile not found",
        },
        { status: 404 }
      );
    }

    if (
      reservation.photographerId.toString() !==
      photographerProfile._id.toString()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to update this reservation",
        },
        { status: 403 }
      );
    }

    reservation.status = status;
    await reservation.save();

    return NextResponse.json({
      success: true,
      message: `Reservation ${status} successfully`,
      reservation,
    });
  } catch (error) {
    console.error("Update reservation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while updating the reservation",
      },
      { status: 500 }
    );
  }
}
export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid reservation ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return NextResponse.json(
        {
          success: false,
          message: "Reservation not found",
        },
        { status: 404 }
      );
    }

    // Only customers can cancel their own reservations
    if (user.role !== "customer") {
      return NextResponse.json(
        {
          success: false,
          message: "Only customers can cancel reservations",
        },
        { status: 403 }
      );
    }

    // Make sure this reservation belongs to the logged-in customer
    if (
      reservation.customerId.toString() !==
      user._id.toString()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to cancel this reservation",
        },
        { status: 403 }
      );
    }

    // Customers can cancel only pending reservations
    if (reservation.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only pending reservations can be cancelled",
        },
        { status: 400 }
      );
    }

    await Reservation.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Reservation cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel reservation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while cancelling the reservation",
      },
      { status: 500 }
    );
  }
}