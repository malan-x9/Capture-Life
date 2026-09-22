import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Photographer from "@/models/Photographer";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await connectDB();

    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email, and password are required",
        },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User with this email already exists",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userRole = role || "customer";

    if (userRole !== "customer" && userRole !== "photographer") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user role",
        },
        { status: 400 }
      );
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
    });

    // Every photographer account must have a Photographer profile
    // linked to the newly created User document.
    if (user.role === "photographer") {
      try {
        await Photographer.create({
          userId: user._id,
          businessName: `${user.name}'s Photography`,
          bio: "Complete your photographer profile to tell customers about your services.",
          location: "Not specified",
          specialties: [],
          experience: 0,
          startingPrice: 0,
          portfolio: [],
          isAvailable: true,
        });
      } catch (photographerError) {
        // Avoid leaving an incomplete photographer account if profile
        // creation fails.
        await User.findByIdAndDelete(user._id);
        throw photographerError;
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong during registration",
      },
      { status: 500 }
    );
  }
}