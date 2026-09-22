import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";

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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select an image",
        },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          success: false,
          message: "Only image files are allowed",
        },
        { status: 400 }
      );
    }

    const maxFileSize = 5 * 1024 * 1024;

    if (file.size > maxFileSize) {
      return NextResponse.json(
        {
          success: false,
          message: "Image size must be less than 5MB",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const currentUser = await User.findById(user._id);

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    const dataUri = `data:${file.type};base64,${base64Image}`;

    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: `capture-life/${user._id}/profile`,
      resource_type: "image",
    });

    currentUser.profileImage = uploadResult.secure_url;

    await currentUser.save();

    return NextResponse.json({
      success: true,
      message: "Profile picture updated successfully",
      profileImage: uploadResult.secure_url,
    });
  } catch (error) {
    console.error("Profile image upload error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while uploading the profile picture",
      },
      { status: 500 }
    );
  }
}


export async function DELETE() {
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

    const currentUser = await User.findById(user._id);

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    if (!currentUser.profileImage) {
      return NextResponse.json(
        {
          success: false,
          message: "No profile picture to remove",
        },
        { status: 400 }
      );
    }

    // Extract the Cloudinary public ID from the saved image URL.
    // Example:
    // .../upload/v123/capture-life/userId/profile/image.jpg
    // becomes:
    // capture-life/userId/profile/image
    const uploadMarker = "/upload/";
    const uploadIndex = currentUser.profileImage.indexOf(uploadMarker);

    if (uploadIndex !== -1) {
      let publicId = currentUser.profileImage.slice(
        uploadIndex + uploadMarker.length
      );

      // Remove Cloudinary transformation/version segments if present.
      publicId = publicId.replace(/^v\d+\//, "");

      // Remove the file extension.
      publicId = publicId.replace(/\\.[^/.]+$/, "");

      try {
        await cloudinary.uploader.destroy(publicId, {
          resource_type: "image",
        });
      } catch (cloudinaryError) {
        console.error(
          "Cloudinary profile image deletion error:",
          cloudinaryError
        );
      }
    }

    // Remove the image URL from MongoDB even if Cloudinary deletion fails.
    currentUser.profileImage = "";
    await currentUser.save();

    return NextResponse.json({
      success: true,
      message: "Profile picture removed successfully",
    });
  } catch (error) {
    console.error("Profile image removal error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while removing the profile picture",
      },
      { status: 500 }
    );
  }
}
