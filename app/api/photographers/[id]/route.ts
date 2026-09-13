import { connectDB } from "@/lib/db";
import Photographer from "@/models/Photographer";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    await connectDB();

    const photographer = await Photographer.findById(id)
      .populate("userId", "name email profileImage")
      .lean();

    if (!photographer) {
      return NextResponse.json(
        {
          success: false,
          message: "Photographer not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      photographer,
    });
  } catch (error) {
    console.error("Get photographer error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while fetching photographer",
      },
      { status: 500 }
    );
  }
}