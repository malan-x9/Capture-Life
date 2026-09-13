"use client";

import { ChangeEvent, FormEvent, useState } from "react";

export default function PhotographerProfilePage() {
  const [businessName, setBusinessName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [experience, setExperience] = useState("");
  const [startingPrice, setStartingPrice] = useState("");

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  }

  async function uploadImages() {
    const imageUrls: string[] = [];

    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Image upload failed");
      }

      imageUrls.push(data.imageUrl);
    }

    return imageUrls;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      // Upload selected images first
      let portfolioUrls = uploadedImages;

      if (selectedFiles.length > 0) {
        setMessage("Uploading portfolio images...");

        const newImageUrls = await uploadImages();
        portfolioUrls = [...uploadedImages, ...newImageUrls];

        setUploadedImages(portfolioUrls);
      }

      setMessage("Creating photographer profile...");

      const response = await fetch("/api/photographers", {
        method: "POST",
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
          experience: Number(experience) || 0,
          startingPrice: Number(startingPrice),
          portfolio: portfolioUrls,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Profile creation failed");
        return;
      }

      setMessage("Photographer profile created successfully!");

      // Clear form after successful creation
      setBusinessName("");
      setBio("");
      setLocation("");
      setSpecialties("");
      setExperience("");
      setStartingPrice("");
      setSelectedFiles([]);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f0e8] px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-4xl font-serif text-[#241914]">
            Create Photographer Profile
          </h1>

          <p className="mt-3 text-[#6b625b]">
            Add your professional details and portfolio so customers can
            discover your photography services.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Business Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#241914]">
                Business Name
              </label>

              <input
                type="text"
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
                placeholder="Example: Malan Photography"
                required
                className="w-full rounded-xl border border-[#ddd4c9] px-4 py-3 outline-none focus:border-[#dd492f]"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#241914]">
                Professional Bio
              </label>

              <textarea
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                placeholder="Tell customers about your photography experience..."
                required
                rows={5}
                className="w-full rounded-xl border border-[#ddd4c9] px-4 py-3 outline-none focus:border-[#dd492f]"
              />
            </div>

            {/* Location */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#241914]">
                Location
              </label>

              <input
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Example: Colombo, Sri Lanka"
                required
                className="w-full rounded-xl border border-[#ddd4c9] px-4 py-3 outline-none focus:border-[#dd492f]"
              />
            </div>

            {/* Specialties */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#241914]">
                Specialties
              </label>

              <input
                type="text"
                value={specialties}
                onChange={(event) => setSpecialties(event.target.value)}
                placeholder="Wedding, Portrait, Event"
                className="w-full rounded-xl border border-[#ddd4c9] px-4 py-3 outline-none focus:border-[#dd492f]"
              />

              <p className="mt-2 text-xs text-[#6b625b]">
                Separate each specialty with a comma.
              </p>
            </div>

            {/* Experience and Price */}
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#241914]">
                  Experience in Years
                </label>

                <input
                  type="number"
                  min="0"
                  value={experience}
                  onChange={(event) => setExperience(event.target.value)}
                  placeholder="Example: 5"
                  className="w-full rounded-xl border border-[#ddd4c9] px-4 py-3 outline-none focus:border-[#dd492f]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#241914]">
                  Starting Price
                </label>

                <input
                  type="number"
                  min="0"
                  value={startingPrice}
                  onChange={(event) => setStartingPrice(event.target.value)}
                  placeholder="Example: 25000"
                  required
                  className="w-full rounded-xl border border-[#ddd4c9] px-4 py-3 outline-none focus:border-[#dd492f]"
                />
              </div>
            </div>

            {/* Portfolio Upload */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#241914]">
                Portfolio Images
              </label>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="block w-full rounded-xl border border-[#ddd4c9] p-3 text-sm"
              />

              {selectedFiles.length > 0 && (
                <p className="mt-2 text-sm text-[#6b625b]">
                  {selectedFiles.length} image
                  {selectedFiles.length > 1 ? "s" : ""} selected
                </p>
              )}

              {uploadedImages.length > 0 && (
                <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
                  {uploadedImages.map((imageUrl, index) => (
                    <img
                      key={`${imageUrl}-${index}`}
                      src={imageUrl}
                      alt={`Portfolio image ${index + 1}`}
                      className="h-32 w-full rounded-xl object-cover"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-[#dd492f] px-7 py-3 font-medium text-white transition hover:bg-[#b93624] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Please wait..." : "Create Profile"}
            </button>

            {message && (
              <p className="text-sm text-[#6b625b]">{message}</p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}