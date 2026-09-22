import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";

export async function PATCH() {
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

    await Notification.updateMany(
      {
        recipient: user._id,
        read: false,
      },
      {
        $set: { read: true },
      }
    );

    return NextResponse.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while updating notifications",
      },
      { status: 500 }
    );
  }
}