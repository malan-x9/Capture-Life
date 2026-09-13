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
  portfolio: string[];
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

  function clearFilters() {
    setSearch("");
    setSpecialty("all");
    setAvailability("all");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f0e8] px-6 py-16">
        <p className="text-center text-[#6b625b]">
          Loading photographers...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f0e8] px-6 py-16">
      <div className="mx-auto max-w-7xl">
        {/* Page Heading */}
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.25em] text-[#dd492f]">
            Discover talent
          </p>

          <h1 className="mt-3 text-5xl font-serif text-[#241914]">
            Find Your Photographer
          </h1>

          <p className="mt-4 max-w-2xl text-[#6b625b]">
            Search and filter talented photographers to find the perfect
            person for your special moments.
          </p>
        </div>

        {/* Search and Filters */}
        <section className="mb-12 rounded-2xl bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search Input */}
            <div className="md:col-span-1">
              <label className="mb-2 block text-sm font-medium text-[#241914]">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, location, or specialty..."
                className="w-full rounded-xl border border-[#ddd4c9] px-4 py-3 outline-none transition focus:border-[#dd492f]"
              />
            </div>

            {/* Specialty Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#241914]">
                Specialty
              </label>

              <select
                value={specialty}
                onChange={(event) => setSpecialty(event.target.value)}
                className="w-full rounded-xl border border-[#ddd4c9] bg-white px-4 py-3 outline-none focus:border-[#dd492f]"
              >
                <option value="all">All specialties</option>

                {specialties.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#241914]">
                Availability
              </label>

              <select
                value={availability}
                onChange={(event) => setAvailability(event.target.value)}
                className="w-full rounded-xl border border-[#ddd4c9] bg-white px-4 py-3 outline-none focus:border-[#dd492f]"
              >
                <option value="all">All photographers</option>
                <option value="available">Available only</option>
                <option value="unavailable">Unavailable only</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-[#6b625b]">
              Showing{" "}
              <span className="font-medium text-[#241914]">
                {filteredPhotographers.length}
              </span>{" "}
              of {photographers.length} photographers
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-[#dd492f] px-5 py-2 text-sm font-medium text-[#dd492f] transition hover:bg-[#dd492f] hover:text-white"
            >
              Clear Filters
            </button>
          </div>
        </section>

        {/* Error Message */}
        {message && (
          <p className="mb-8 rounded-xl bg-red-100 p-4 text-red-700">
            {message}
          </p>
        )}

        {/* Empty Results */}
        {filteredPhotographers.length === 0 && !message && (
          <div className="rounded-2xl bg-white p-12 text-center">
            <h2 className="text-2xl font-serif text-[#241914]">
              No photographers found
            </h2>

            <p className="mt-3 text-[#6b625b]">
              Try changing your search or filters.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-full bg-[#dd492f] px-6 py-3 text-sm font-medium text-white"
            >
              Reset Search
            </button>
          </div>
        )}

        {/* Photographer Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredPhotographers.map((photographer) => {
            const previewImage =
              photographer.portfolio?.[0] ||
              photographer.userId?.profileImage ||
              "";

            return (
              <Link
                key={photographer._id}
                href={`/photographers/${photographer._id}`}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Image */}
                <div className="h-72 w-full overflow-hidden bg-[#e8dfd4]">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt={photographer.businessName}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#8b8178]">
                      No portfolio image
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-serif text-[#241914]">
                        {photographer.businessName}
                      </h2>
                      

                      <p className="mt-1 text-sm text-[#6b625b]">
                        {photographer.location}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        photographer.isAvailable
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {photographer.isAvailable
                        ? "Available"
                        : "Unavailable"}
                    </span>
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#6b625b]">
                    {photographer.bio}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {photographer.specialties
                      ?.slice(0, 3)
                      .map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-[#f5f0e8] px-3 py-1 text-xs text-[#6b625b]"
                        >
                          {item}
                        </span>
                      ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-[#eee5dc] pt-4">
                    <div>
                      <p className="text-xs text-[#8b8178]">
                        Starting from
                      </p>

                      <p className="font-medium text-[#241914]">
                        Rs. {photographer.startingPrice.toLocaleString()}
                      </p>
                    </div>

                    <span className="text-sm font-medium text-[#dd492f]">
                      View Profile →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}