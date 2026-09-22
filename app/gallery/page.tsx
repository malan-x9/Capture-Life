"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Photographer = {
  _id: string;
  businessName: string;
  bio: string;
  location: string;
  specialties: string[];
  experience: number;
  startingPrice: number;
  portfolio: {
    url: string;
    publicId: string;
  }[];
  isAvailable: boolean;
  userId?: {
    name: string;
    email: string;
    profileImage?: string;
  };
};

export default function GalleryPage() {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [availability, setAvailability] = useState("all");

  useEffect(() => {
    async function fetchPhotographers() {
      try {
        const response = await fetch("/api/photographers");
        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Failed to fetch photographers");
          return;
        }

        setPhotographers(data.photographers);
      } catch (error) {
        console.error(error);
        setMessage("Something went wrong while loading photographers");
      } finally {
        setLoading(false);
      }
    }

    fetchPhotographers();
  }, []);

  // Create a unique list of specialties
  const specialties = useMemo(() => {
    const allSpecialties = photographers.flatMap(
      (photographer) => photographer.specialties || []
    );

    return Array.from(new Set(allSpecialties));
  }, [photographers]);

  // Filter photographers based on search and selected filters
  const filteredPhotographers = useMemo(() => {
    return photographers.filter((photographer) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        searchText === "" ||
        photographer.businessName.toLowerCase().includes(searchText) ||
        photographer.location.toLowerCase().includes(searchText) ||
        photographer.bio.toLowerCase().includes(searchText) ||
        photographer.specialties.some((item) =>
          item.toLowerCase().includes(searchText)
        );

      const matchesSpecialty =
        specialty === "all" ||
        photographer.specialties.some(
          (item) => item.toLowerCase() === specialty.toLowerCase()
        );

      const matchesAvailability =
        availability === "all" ||
        (availability === "available" && photographer.isAvailable) ||
        (availability === "unavailable" && !photographer.isAvailable);

      return matchesSearch && matchesSpecialty && matchesAvailability;
    });
  }, [photographers, search, specialty, availability]);

  const hasActiveFilters =
    search.trim() !== "" || specialty !== "all" || availability !== "all";

  function clearFilters() {
    setSearch("");
    setSpecialty("all");
    setAvailability("all");
  }

  return (
    <main className="min-h-screen bg-[#eeedeb] font-(--font-body)">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap");
        :root {
          --font-display: "Inter", system-ui, sans-sans;
          --font-body: "Inter", system-ui, sans-sans;
        }
        .font-sans {
          font-family: var(--font-display);
        }
      `}</style>
      <div className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
        {/* Page Heading */}
        <div className="mb-10 max-w-2xl">
          <h1 className="font-sans text-4xl  tracking-tight text-[#241914] sm:text-5xl font-medium">
            Find Your <span className="text-[#dd492f]">Photographer</span>
          </h1>
          <p className="mt-3 text-[#6b625b]">
            Search and filter talented photographers to find the perfect
            person for your special moments.
          </p>
        </div>

        {/* Search and Filters */}
        <section className="mb-10 flex flex-col gap-4 rounded-2xl border border-[#e8ded2] bg-white p-5 sm:flex-row sm:items-center">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, location, or specialty"
            className="w-full rounded-xl border border-[#e8ded2] px-4 py-2.5 text-sm text-[#241914] outline-none transition placeholder:text-[#a79c8f] focus:border-[#dd492f] sm:flex-1"
          />

          <select
            value={specialty}
            onChange={(event) => setSpecialty(event.target.value)}
            className="w-full rounded-xl border border-[#e8ded2] bg-white px-4 py-2.5 text-sm text-[#241914] outline-none focus:border-[#dd492f] sm:w-48"
          >
            <option value="all">All specialties</option>
            {specialties.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={availability}
            onChange={(event) => setAvailability(event.target.value)}
            className="w-full rounded-xl border border-[#e8ded2] bg-white px-4 py-2.5 text-sm text-[#241914] outline-none focus:border-[#dd492f] sm:w-44"
          >
            <option value="all">Any availability</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="whitespace-nowrap text-sm font-medium text-[#dd492f] transition hover:text-[#b93624]"
            >
              Clear
            </button>
          )}
        </section>

        {/* Result count */}
        {!loading && (
          <p className="mb-6 text-sm text-[#8b8178]">
            {filteredPhotographers.length}{" "}
            {filteredPhotographers.length === 1 ? "photographer" : "photographers"}
          </p>
        )}

        {/* Error Message */}
        {message && (
          <p className="mb-8 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {message}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-2xl bg-white"
              >
                <div className="aspect-[4/3] bg-[#ece4d8]" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-2/3 rounded bg-[#ece4d8]" />
                  <div className="h-3 w-1/2 rounded bg-[#ece4d8]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty Results */}
        {!loading && filteredPhotographers.length === 0 && !message && (
          <div className="rounded-2xl border border-[#e8ded2] bg-white p-14 text-center">
            <h2 className="font-sans text-xl text-[#241914]">
              No photographers found
            </h2>
            <p className="mt-2 text-sm text-[#8b8178]">
              Try adjusting your search or filters.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 rounded-full bg-[#dd492f] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#b93624]"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Photographer Cards */}
        {!loading && filteredPhotographers.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPhotographers.map((photographer) => {
              const previewImage =
                photographer.userId?.profileImage ||
                photographer.portfolio?.[0]?.url ||
                "";

              return (
                <Link
                  key={photographer._id}
                  href={`/photographers/${photographer._id}`}
                  className="group overflow-hidden rounded-2xl bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Image */}
                  <div className="relative aspect-4/3 w-full overflow-hidden bg-[#ece4d8]">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt={photographer.businessName}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="h-8 w-8 text-[#c7bcae]"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5l5.5-5.5a2 2 0 0 1 2.8 0l6.2 6.2M14 13l1.5-1.5a2 2 0 0 1 2.8 0L21 14M8.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM4.5 20.5h15a1 1 0 0 0 1-1v-15a1 1 0 0 0-1-1h-15a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1z"
                          />
                        </svg>
                      </div>
                    )}

                    <span
                      className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium ${
                        photographer.isAvailable
                          ? "bg-white/90 text-emerald-700"
                          : "bg-white/90 text-[#8b8178]"
                      }`}
                    >
                      {photographer.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="p-5">
                    <h2 className="font-sans text-xl text-[#241914]">
                      {photographer.businessName}
                    </h2>
                    <p className="mt-0.5 text-sm text-[#8b8178]">
                      {photographer.location}
                    </p>

                    {photographer.specialties?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {photographer.specialties.slice(0, 2).map((item) => (
                          <span
                            key={item}
                            className="rounded-full bg-[#f5f0e8] px-2.5 py-1 text-xs text-[#6b625b]"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between border-t border-[#eee5dc] pt-4">
                      <p className="text-sm text-[#241914]">
                        <span className="text-[#8b8178]">From </span>
                        Rs. {photographer.startingPrice.toLocaleString()}
                      </p>

                      <span className="text-sm font-medium text-[#dd492f]">
                        View →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}