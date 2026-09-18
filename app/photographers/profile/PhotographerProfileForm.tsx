"use client";

import { FormEvent, useEffect, useState } from "react";

type PortfolioImage = {
  url: string;
  publicId: string;
};

type Photographer = {
  _id: string;
  businessName: string;
  bio: string;
  location: string;
  specialties: string[];
  experience: number;
  startingPrice: number;
  portfolio: PortfolioImage[];
  isAvailable: boolean;
};

export default function PhotographerProfileForm() {
  const [photographer, setPhotographer] = useState<Photographer | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioImage[]>([]);
const [deletingImage, setDeletingImage] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [experience, setExperience] = useState("");
  const [startingPrice, setStartingPrice] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/photographers");
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load profile");
          return;
        }

        const currentUserResponse = await fetch("/api/auth/me");
        const currentUserData = await currentUserResponse.json();

        const currentUserId = currentUserData.user?._id;

        const myProfile = data.photographers?.find(
          (item: Photographer & { userId?: string | { _id: string } }) => {
            if (typeof item.userId === "string") {
              return item.userId === currentUserId;
            }

            return item.userId?._id === currentUserId;
          }
        );

        if (!myProfile) {
          setError("Your photographer profile could not be found");
          return;
        }
        setPhotographer(myProfile);
setBusinessName(myProfile.businessName || "");
setBio(myProfile.bio || "");
setLocation(myProfile.location || "");
setSpecialties(myProfile.specialties?.join(", ") || "");
setExperience(String(myProfile.experience ?? ""));
setStartingPrice(String(myProfile.startingPrice ?? ""));
setPortfolio(myProfile.portfolio || []);
        } catch (error) {
        console.error("Fetch profile error:", error);
        setError("Something went wrong while loading your profile");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await fetch("/api/photographers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessName,
          bio,
          location,
          specialties: specialties
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          experience: Number(experience),
          startingPrice: Number(startingPrice),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update profile");
        return;
      }

      setPhotographer(data.photographer);
      setSuccess(data.message || "Profile updated successfully");
    } catch (error) {
      console.error("Update profile error:", error);
      setError("Something went wrong while updating your profile");
    } finally {
      setSaving(false);
    }
  }
async function handleDeleteImage(image: PortfolioImage) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this portfolio image?"
  );

  if (!confirmed) {
    return;
  }

  setDeletingImage(image.publicId || image.url);
  setError("");
  setSuccess("");

  try {
    const response = await fetch("/api/photographers/portfolio", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        publicId: image.publicId,
        url: image.url,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Failed to delete portfolio image");
      return;
    }

    setPortfolio((previousPortfolio) =>
      previousPortfolio.filter(
        (portfolioImage) =>
          portfolioImage.publicId !== image.publicId &&
          portfolioImage.url !== image.url
      )
    );

    setPhotographer(data.photographer);
    setSuccess(data.message || "Portfolio image deleted successfully");
  } catch (error) {
    console.error("Delete portfolio image error:", error);
    setError("Something went wrong while deleting the image");
  } finally {
    setDeletingImage(null);
  }
}

  if (loading) {
    return (
      <div className="rounded-2xl bg-[#e8dfd4] p-6">
        <p className="text-gray-700">Loading your profile...</p>
      </div>
    );
  }

  if (!photographer) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 text-red-700">
        {error || "Photographer profile not found"}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#dd492f]">
          Photographer Profile
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-gray-900">
          Manage Your Profile
        </h1>

        <p className="mt-2 text-gray-600">
          Keep your business information updated so customers can find you
          easily.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl bg-white p-6 shadow-sm md:p-8"
      >
        <div>
          <label
            htmlFor="businessName"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Business Name
          </label>

          <input
            id="businessName"
            type="text"
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#dd492f]"
          />
        </div>

        <div>
          <label
            htmlFor="bio"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Bio
          </label>

          <textarea
            id="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={5}
            placeholder="Tell customers about your photography services..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#dd492f]"
          />
        </div>

        <div>
          <label
            htmlFor="location"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Location
          </label>

          <input
            id="location"
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#dd492f]"
          />
        </div>

        <div>
          <label
            htmlFor="specialties"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Specialties
          </label>

          <input
            id="specialties"
            type="text"
            value={specialties}
            onChange={(event) => setSpecialties(event.target.value)}
            placeholder="Wedding, Portrait, Event"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#dd492f]"
          />

          <p className="mt-2 text-xs text-gray-500">
            Separate each specialty with a comma.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="experience"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Experience in Years
            </label>

            <input
              id="experience"
              type="number"
              min="0"
              value={experience}
              onChange={(event) => setExperience(event.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#dd492f]"
            />
          </div>

          <div>
            <label
              htmlFor="startingPrice"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Starting Price
            </label>

            <input
              id="startingPrice"
              type="number"
              min="0"
              value={startingPrice}
              onChange={(event) => setStartingPrice(event.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#dd492f]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-[#dd492f] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#9f3320] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving Changes..." : "Save Changes"}
        </button>
      </form>
      <div className="mt-10">
  <div className="mb-5">
    <h2 className="text-2xl font-semibold text-gray-900">
      Portfolio Images
    </h2>

    <p className="mt-1 text-sm text-gray-500">
      Manage the images customers can see on your profile.
    </p>
  </div>

  {portfolio.length === 0 ? (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
      <p className="text-gray-500">
        You have not added any portfolio images yet.
      </p>
    </div>
  ) : (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {portfolio.map((image, index) => (
        <div
          key={`${image.publicId || image.url}-${index}`}
          className="overflow-hidden rounded-2xl bg-white shadow-sm"
        >
          <img
            src={image.url}
            alt="Portfolio image"
            className="h-56 w-full object-cover"
          />

          <div className="p-4">
            <button
              type="button"
              onClick={() => handleDeleteImage(image)}
              disabled={deletingImage === (image.publicId || image.url)}
              className="w-full rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deletingImage === (image.publicId || image.url)
                ? "Deleting..."
                : "Delete Image"}
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
    </div>
  );
}