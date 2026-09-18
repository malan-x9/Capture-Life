import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Photographer from "@/models/Photographer";
export async function POST(request: Request) {
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
          message: "Only photographers can create a photographer profile",
        },
        { status: 403 }
      );
    }

    await connectDB();

    const existingProfile = await Photographer.findOne({
      userId: user._id,
    });

    if (existingProfile) {
      return NextResponse.json(
        {
          success: false,
          message: "Photographer profile already exists",
        },
        { status: 409 }
      );
    }

    const {
  businessName,
  bio,
  location,
  specialties,
  experience,
  startingPrice,
  portfolio,
} = await request.json();

    if (
      !businessName ||
      !bio ||
      !location ||
      startingPrice === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Business name, bio, location, and starting price are required",
        },
        { status: 400 }
      );
    }

    const photographer = await Photographer.create({
  userId: user._id,
  businessName,
  bio,
  location,
  specialties: specialties || [],
  experience: experience || 0,
  startingPrice,
  portfolio: Array.isArray(portfolio) ? portfolio : [],
});

    return NextResponse.json(
      {
        success: true,
        message: "Photographer profile created successfully",
        photographer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create photographer profile error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while creating the profile",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const photographers = await Photographer.find()
      .populate("userId", "name email profileImage")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      photographers,
    });
  } catch (error) {
    console.error("Get photographers error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while fetching photographers",
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

    if (user.role !== "photographer") {
      return NextResponse.json(
        {
          success: false,
          message: "Only photographers can update a photographer profile",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      businessName,
      bio,
      location,
      specialties,
      experience,
      startingPrice,
    } = body;

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

    if (businessName !== undefined) {
      photographer.businessName = businessName;
    }

    if (bio !== undefined) {
      photographer.bio = bio;
    }

    if (location !== undefined) {
      photographer.location = location;
    }

    if (specialties !== undefined) {
      photographer.specialties = specialties;
    }

    if (experience !== undefined) {
      photographer.experience = Number(experience);
    }

    if (startingPrice !== undefined) {
      photographer.startingPrice = Number(startingPrice);
    }

    await photographer.save();

    return NextResponse.json({
      success: true,
      message: "Photographer profile updated successfully",
      photographer,
    });
  } catch (error) {
    console.error("Update photographer profile error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while updating your profile",
      },
      { status: 500 }
    );
  }
}