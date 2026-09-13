import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Photographer from "@/models/Photographer";
import Reservation from "@/models/Reservation";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in to make a reservation",
        },
        { status: 401 }
      );
    }

    if (user.role !== "customer") {
      return NextResponse.json(
        {
          success: false,
          message: "Only customers can make reservations",
        },
        { status: 403 }
      );
    }

    const {
      photographerId,
      eventDate,
      eventType,
      eventLocation,
      message,
    } = await request.json();

    if (
      !photographerId ||
      !eventDate ||
      !eventType ||
      !eventLocation
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Photographer, event date, event type, and event location are required",
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(photographerId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid photographer ID",
        },
        { status: 400 }
      );
    }

const selectedDate = new Date(eventDate);

if (isNaN(selectedDate.getTime())) {
  return NextResponse.json(
    {
      success: false,
      message: "Invalid event date",
    },
    { status: 400 }
  );
}

if (selectedDate <= new Date()) {
  return NextResponse.json(
    {
      success: false,
      message: "Event date must be in the future",
    },
    { status: 400 }
  );
}

    await connectDB();

const photographer = await Photographer.findById(photographerId);

if (!photographer) {
  return NextResponse.json(
    {
      success: false,
      message: "Photographer not found",
    },
    { status: 404 }
  );
}
// Check whether this photographer already has a reservation
// on the selected event date.
const startOfDay = new Date(selectedDate);
startOfDay.setHours(0, 0, 0, 0);

const endOfDay = new Date(selectedDate);
endOfDay.setHours(23, 59, 59, 999);

const existingReservation = await Reservation.findOne({
  photographerId: photographer._id,
  eventDate: {
    $gte: startOfDay,
    $lte: endOfDay,
  },
  status: {
    $in: ["pending", "accepted"],
  },
});

if (existingReservation) {
  return NextResponse.json(
    {
      success: false,
      message:
        "This photographer already has a reservation request for that date",
    },
    { status: 409 }
  );
}

if (!photographer.isAvailable) {
  return NextResponse.json(
    {
      success: false,
      message: "This photographer is currently unavailable",
    },
    { status: 400 }
  );
}

    if (!photographer.isAvailable) {
      return NextResponse.json(
        {
          success: false,
          message: "This photographer is currently unavailable",
        },
        { status: 400 }
      );
    }

    const reservation = await Reservation.create({
      customerId: user._id,
      photographerId,
      eventDate: selectedDate,
      eventType,
      eventLocation,
      message: message || "",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Reservation request submitted successfully",
        reservation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create reservation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while creating the reservation",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
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

    await connectDB();

    let reservations;

    if (user.role === "customer") {
      reservations = await Reservation.find({
        customerId: user._id,
      })
        .populate({
          path: "photographerId",
          populate: {
            path: "userId",
            select: "name email profileImage",
          },
        })
        .sort({ createdAt: -1 });
    } else {
      const photographerProfile = await Photographer.findOne({
        userId: user._id,
      });

      if (!photographerProfile) {
        return NextResponse.json({
          success: true,
          reservations: [],
        });
      }

      reservations = await Reservation.find({
        photographerId: photographerProfile._id,
      })
        .populate("customerId", "name email profileImage")
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({
      success: true,
      reservations,
    });
  } catch (error) {
    console.error("Get reservations error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while fetching reservations",
      },
      { status: 500 }
    );
  }
}