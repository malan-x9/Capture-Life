import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Photographer from "@/models/Photographer";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
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

    if (user.role !== "photographer") {
      return NextResponse.json(
        {
          success: false,
          message: "Only photographers can update availability",
        },
        { status: 403 }
      );
    }

    const { isAvailable } = await request.json();

    if (typeof isAvailable !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "isAvailable must be true or false",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const photographer = await Photographer.findOne({
      userId: user._id,
    });

    if (!photographer) {
      return NextResponse.json(
        {
          success: false,
          message: "Photographer profile not found",
        },
        { status: 404 }
      );
    }

    photographer.isAvailable = isAvailable;
    await photographer.save();

    return NextResponse.json({
      success: true,
      message: isAvailable
        ? "You are now available"
        : "You are now unavailable",
      photographer,
    });
  } catch (error) {
    console.error("Update availability error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while updating availability",
      },
      { status: 500 }
    );
  }
}