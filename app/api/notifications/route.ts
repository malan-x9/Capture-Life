import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";

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

    const notifications = await Notification.find({
      recipient: user._id,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = notifications.filter(
      (notification) => !notification.read
    ).length;

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while loading notifications",
      },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    const notificationId = body.notificationId;

    if (!notificationId) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification ID is required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        recipient: user._id,
      },
      {
        $set: { read: true },
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while updating the notification",
      },
      { status: 500 }
    );
  }
}
