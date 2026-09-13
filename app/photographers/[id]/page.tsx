"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Photographer = {
  _id: string;
  businessName: string;
  bio: string;
  location: string;
  specialties: string[];
  experience: number;
  startingPrice: number;
  portfolio: string[];
  isAvailable: boolean;
  userId?: {
    name: string;
    email: string;
    profileImage?: string;
  };
};

export default function PhotographerDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [photographer, setPhotographer] = useState<Photographer | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchPhotographer() {
      try {
        const response = await fetch(`/api/photographers/${id}`);
        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Photographer not found");
          return;
        }

        setPhotographer(data.photographer);
      } catch (error) {
        console.error(error);
        setMessage("Something went wrong while loading the profile");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchPhotographer();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f0e8] px-6 py-16">
        <p className="text-center text-[#6b625b]">
          Loading photographer profile...
        </p>
      </main>
    );
  }

  if (message || !photographer) {
    return (
      <main className="min-h-screen bg-[#f5f0e8] px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <p className="rounded-xl bg-red-100 p-4 text-red-700">
            {message || "Photographer not found"}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f0e8] px-6 py-16">
      <div className="mx-auto max-w-6xl">
        {/* Back Link */}
        <Link
          href="/gallery"
          className="text-sm font-medium text-[#dd492f] hover:underline"
        >
          ← Back to Gallery
        </Link>

        {/* Header */}
        <section className="mt-8 grid gap-10 md:grid-cols-2 md:items-center">
          <div className="overflow-hidden rounded-2xl bg-[#e8dfd4]">
            {photographer.portfolio?.[0] ? (
              <img
                src={photographer.portfolio[0]}
                alt={photographer.businessName}
                className="h-[420px] w-full object-cover"
              />
            ) : photographer.userId?.profileImage ? (
              <img
                src={photographer.userId.profileImage}
                alt={photographer.businessName}
                className="h-[420px] w-full object-cover"
              />
            ) : (
              <div className="flex h-[420px] items-center justify-center text-[#8b8178]">
                No profile image
              </div>
            )}
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#dd492f]">
              Photographer
            </p>

            <h1 className="mt-3 text-5xl font-serif text-[#241914]">
              {photographer.businessName}
            </h1>

            <p className="mt-3 text-[#6b625b]">
              {photographer.location}
            </p>

            <p className="mt-6 leading-7 text-[#6b625b]">
              {photographer.bio}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {photographer.specialties?.map((specialty) => (
                <span
                  key={specialty}
                  className="rounded-full bg-[#e8dfd4] px-4 py-2 text-sm text-[#51463e]"
                >
                  {specialty}
                </span>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-5">
              <div>
                <p className="text-sm text-[#8b8178]">Experience</p>
                <p className="mt-1 text-lg font-medium text-[#241914]">
                  {photographer.experience} years
                </p>
              </div>

              <div>
                <p className="text-sm text-[#8b8178]">Starting Price</p>
                <p className="mt-1 text-lg font-medium text-[#241914]">
                  Rs. {photographer.startingPrice.toLocaleString()}
                </p>
              </div>
            </div>

            {photographer.isAvailable ? (
  <Link
    href={`/reserve?photographerId=${photographer._id}`}
    className="mt-8 inline-block rounded-full bg-[#dd492f] px-7 py-3 font-medium text-white transition hover:bg-[#b93624]"
  >
    Reserve This Photographer
  </Link>
) : (
  <div className="mt-8">
    <button
      disabled
      className="cursor-not-allowed rounded-full bg-gray-300 px-7 py-3 font-medium text-gray-600"
    >
      Currently Unavailable
    </button>

    <p className="mt-2 text-sm text-[#6b625b]">
      This photographer is not accepting new reservations right now.
    </p>
  </div>
)}
          </div>
        </section>

        {/* Portfolio */}
        <section className="mt-20">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.2em] text-[#dd492f]">
              Selected work
            </p>

            <h2 className="mt-2 text-4xl font-serif text-[#241914]">
              Portfolio
            </h2>
          </div>

          {photographer.portfolio?.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {photographer.portfolio.map((imageUrl, index) => (
                <div
                  key={`${imageUrl}-${index}`}
                  className="group overflow-hidden rounded-2xl bg-[#e8dfd4]"
                >
                  <img
                    src={imageUrl}
                    alt={`${photographer.businessName} portfolio image ${
                      index + 1
                    }`}
                    className="h-80 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-10 text-center text-[#6b625b]">
              This photographer has not uploaded portfolio images yet.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}