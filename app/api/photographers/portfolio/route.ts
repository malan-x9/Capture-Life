import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Photographer, {
  IPortfolioImage,
} from "@/models/Photographer";
import cloudinary from "@/lib/cloudinary";

export async function DELETE(request: Request) {
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
          message: "Only photographers can delete portfolio images",
        },
        { status: 403 }
      );
    }

    const { publicId, url } = await request.json();

    if (!publicId && !url) {
      return NextResponse.json(
        {
          success: false,
          message: "Image information is required",
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

    const imageExists = photographer.portfolio.some(
      (image: IPortfolioImage) =>
        (publicId && image.publicId === publicId) ||
        (url && image.url === url)
    );

    if (!imageExists) {
      return NextResponse.json(
        {
          success: false,
          message: "Portfolio image not found in your profile",
        },
        { status: 404 }
      );
    }

    /*
     * Try deleting the image from Cloudinary.
     * Even if Cloudinary cannot find it, continue removing
     * the image record from MongoDB.
     */
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.warn(
          "Cloudinary image could not be deleted:",
          cloudinaryError
        );
      }
    }

    photographer.portfolio = photographer.portfolio.filter(
      (image: IPortfolioImage) =>
        !(
          (publicId && image.publicId === publicId) ||
          (url && image.url === url)
        )
    );

    await photographer.save();

    return NextResponse.json({
      success: true,
      message: "Portfolio image removed successfully",
      photographer,
    });
  } catch (error) {
    console.error("Delete portfolio image error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while deleting the image",
      },
      { status: 500 }
    );
  }
}