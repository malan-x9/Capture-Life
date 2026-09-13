"use client";

import { FormEvent, useEffect, useState } from "react";

type Photographer = {
  _id: string;
  businessName: string;
  location: string;
  startingPrice: number;
  portfolio: string[];
  isAvailable: boolean;
};

type ReserveFormProps = {
  photographerId: string;
};

export default function ReserveForm({
  photographerId,
}: ReserveFormProps) {
  const [photographer, setPhotographer] =
    useState<Photographer | null>(null);

  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [message, setMessage] = useState("");

  const [loadingPhotographer, setLoadingPhotographer] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    async function fetchPhotographer() {
      try {
        const response = await fetch(
          `/api/photographers/${photographerId}`
        );

        const data = await response.json();

        if (!response.ok) {
          setStatusMessage(
            data.message || "Photographer could not be found"
          );
          return;
        }

        setPhotographer(data.photographer);
      } catch (error) {
        console.error(error);
        setStatusMessage("Failed to load photographer");
      } finally {
        setLoadingPhotographer(false);
      }
    }

    fetchPhotographer();
  }, [photographerId]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          photographerId,
          eventDate,
          eventType,
          eventLocation,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to create reservation"
        );
        return;
      }

      setSuccess(
        data.message || "Reservation submitted successfully"
      );

      setEventDate("");
      setEventType("");
      setEventLocation("");
      setMessage("");
    } catch (error) {
      console.error("Reservation submission error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingPhotographer) {
    return (
      <p className="text-[#6b625b]">
        Loading photographer information...
      </p>
    );
  }

  if (!photographer) {
    return (
      <p className="rounded-xl bg-red-100 p-4 text-red-700">
        {statusMessage || "Photographer not found"}
      </p>
    );
  }

  return (
    <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
      {/* Photographer Summary */}
      <div className="rounded-2xl bg-[#e8dfd4] p-6">
        {photographer.portfolio?.[0] && (
          <img
            src={photographer.portfolio[0]}
            alt={photographer.businessName}
            className="h-64 w-full rounded-xl object-cover"
          />
        )}

        <h2 className="mt-6 text-3xl font-serif text-[#241914]">
          {photographer.businessName}
        </h2>

        <p className="mt-2 text-[#6b625b]">
          {photographer.location}
        </p>

        <p className="mt-5 text-sm text-[#6b625b]">
          Starting price
        </p>

        <p className="text-xl font-medium text-[#241914]">
          Rs. {photographer.startingPrice.toLocaleString()}
        </p>

        <div className="mt-5">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
              photographer.isAvailable
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {photographer.isAvailable
              ? "Available"
              : "Unavailable"}
          </span>
        </div>
      </div>

      {/* Reservation Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white p-8 shadow-sm"
      >
        <h2 className="text-3xl font-serif text-[#241914]">
          Reservation Details
        </h2>

        {/* Error Message */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="mt-8 space-y-6">
          {/* Event Date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#241914]">
              Event Date
            </label>

            <input
              type="date"
              value={eventDate}
              onChange={(event) =>
                setEventDate(event.target.value)
              }
              min={new Date().toISOString().split("T")[0]}
              required
              className="w-full rounded-xl border border-[#ddd4c9] px-4 py-3 outline-none focus:border-[#dd492f]"
            />
          </div>

          {/* Event Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#241914]">
              Event Type
            </label>

            <select
              value={eventType}
              onChange={(event) =>
                setEventType(event.target.value)
              }
              required
              className="w-full rounded-xl border border-[#ddd4c9] bg-white px-4 py-3 outline-none focus:border-[#dd492f]"
            >
              <option value="">Select event type</option>
              <option value="Wedding">Wedding</option>
              <option value="Birthday">Birthday</option>
              <option value="Portrait">
                Portrait Session
              </option>
              <option value="Corporate">Corporate Event</option>
              <option value="Graduation">Graduation</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Event Location */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#241914]">
              Event Location
            </label>

            <input
              type="text"
              value={eventLocation}
              onChange={(event) =>
                setEventLocation(event.target.value)
              }
              placeholder="Example: Colombo, Sri Lanka"
              required
              className="w-full rounded-xl border border-[#ddd4c9] px-4 py-3 outline-none focus:border-[#dd492f]"
            />
          </div>

          {/* Message */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#241914]">
              Additional Message
            </label>

            <textarea
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              placeholder="Tell the photographer about your requirements..."
              rows={5}
              className="w-full rounded-xl border border-[#ddd4c9] px-4 py-3 outline-none focus:border-[#dd492f]"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !photographer.isAvailable}
            className="rounded-full bg-[#dd492f] px-7 py-3 font-medium text-white transition hover:bg-[#b93624] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {!photographer.isAvailable
              ? "Currently Unavailable"
              : submitting
                ? "Submitting..."
                : "Submit Reservation"}
          </button>
        </div>
      </form>
    </div>
  );
}