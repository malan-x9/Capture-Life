"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Reservation = {
  _id: string;
  eventDate: string;
  eventType: string;
  eventLocation: string;
  message?: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  photographerId?: {
    _id: string;
    businessName: string;
    location: string;
    startingPrice: number;
    portfolio: string[];
  };
};
function getStatusClasses(status: string) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-700";

    case "accepted":
      return "bg-green-100 text-green-700";

    case "rejected":
      return "bg-red-100 text-red-700";

    case "completed":
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}
export default function CustomerDashboardPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>( null);
  const totalReservations = reservations.length;

const pendingReservations = reservations.filter(
  (reservation) => reservation.status === "pending"
).length;

const acceptedReservations = reservations.filter(
  (reservation) => reservation.status === "accepted"
).length;

const completedReservations = reservations.filter(
  (reservation) => reservation.status === "completed"
).length;

const rejectedReservations = reservations.filter(
  (reservation) => reservation.status === "rejected"
).length;
  useEffect(() => {
    async function fetchReservations() {
      try {
        const response = await fetch("/api/reservations");
        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Failed to load reservations");
          return;
        }

        setReservations(data.reservations || []);
      } catch (error) {
        console.error(error);
        setMessage("Something went wrong while loading reservations");
      } finally {
        setLoading(false);
      }
    }

    fetchReservations();
  }, []);

  function getStatusStyle(status: Reservation["status"]) {
    if (status === "accepted") {
      return "bg-green-100 text-green-700";
    }

    if (status === "rejected") {
      return "bg-red-100 text-red-700";
    }

    if (status === "completed") {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-yellow-100 text-yellow-700";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f0e8] px-6 py-16">
        <p className="text-center text-[#6b625b]">
          Loading your reservations...
        </p>
      </main>
    );
  }
async function handleCancelReservation(reservationId: string) {
  const confirmed = window.confirm(
    "Are you sure you want to cancel this reservation?"
  );

  if (!confirmed) {
    return;
  }

  setCancellingId(reservationId);

  try {
    const response = await fetch(
      `/api/reservations/${reservationId}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to cancel reservation");
      return;
    }

    // Remove the cancelled reservation from the current list
    setReservations((previousReservations) =>
      previousReservations.filter(
        (reservation) => reservation._id !== reservationId
      )
    );

    alert(data.message || "Reservation cancelled successfully");
  } catch (error) {
    console.error("Cancel reservation error:", error);
    alert("Something went wrong while cancelling the reservation");
  } finally {
    setCancellingId(null);
  }
}
  return (
    <main className="min-h-screen bg-[#f5f0e8] px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.2em] text-[#dd492f]">
          Customer Dashboard
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
  <div className="rounded-2xl bg-white p-5 shadow-sm">
    <p className="text-sm text-gray-500">Total Reservations</p>
    <p className="mt-2 text-3xl font-semibold text-gray-900">
      {totalReservations}
    </p>
  </div>

  <div className="rounded-2xl bg-yellow-50 p-5 shadow-sm">
    <p className="text-sm text-yellow-700">Pending</p>
    <p className="mt-2 text-3xl font-semibold text-yellow-800">
      {pendingReservations}
    </p>
  </div>

  <div className="rounded-2xl bg-green-50 p-5 shadow-sm">
    <p className="text-sm text-green-700">Accepted</p>
    <p className="mt-2 text-3xl font-semibold text-green-800">
      {acceptedReservations}
    </p>
  </div>

  <div className="rounded-2xl bg-blue-50 p-5 shadow-sm">
    <p className="text-sm text-blue-700">Completed</p>
    <p className="mt-2 text-3xl font-semibold text-blue-800">
      {completedReservations}
    </p>
  </div>

  <div className="rounded-2xl bg-red-50 p-5 shadow-sm">
    <p className="text-sm text-red-700">Rejected</p>
    <p className="mt-2 text-3xl font-semibold text-red-800">
      {rejectedReservations}
    </p>
  </div>
</div>
        <h1 className="mt-3 text-5xl font-serif text-[#241914]">
          My Reservations
        </h1>

        <p className="mt-4 text-[#6b625b]">
          Track your photography reservation requests.
        </p>

        {message && (
          <p className="mt-8 rounded-xl bg-red-100 p-4 text-red-700">
            {message}
          </p>
        )}

        {reservations.length === 0 && !message && (
          <div className="mt-10 rounded-2xl bg-white p-10 text-center">
            <h2 className="text-2xl font-serif text-[#241914]">
              No reservations yet
            </h2>

            <p className="mt-3 text-[#6b625b]">
              Find a photographer and submit your first reservation request.
            </p>

            <Link
              href="/gallery"
              className="mt-6 inline-block rounded-full bg-[#dd492f] px-6 py-3 font-medium text-white"
            >
              Explore Photographers
            </Link>
          </div>
        )}

        <div className="mt-10 space-y-6">
          {reservations.map((reservation) => {
            const photographer = reservation.photographerId;
            const image = photographer?.portfolio?.[0];

            return (
              <div
                key={reservation._id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                <div className="grid md:grid-cols-[220px_1fr]">
                  <div className="h-56 bg-[#e8dfd4] md:h-full">
                    {image ? (
                      <img
                        src={image}
                        alt={photographer?.businessName || "Photographer"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-[#8b8178]">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-serif text-[#241914]">
                          {photographer?.businessName ||
                            "Photographer unavailable"}
                        </h2>

                        <p className="mt-1 text-sm text-[#6b625b]">
                          {photographer?.location}
                        </p>
                      </div>

                      <span
  className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${getStatusClasses(
    reservation.status
  )}`}
>
  {reservation.status}
</span>
                      
                    </div>
                    
                    {reservation.status === "pending" && (
  <button
    onClick={() =>
      handleCancelReservation(reservation._id)
    }
    disabled={cancellingId === reservation._id}
    className="mt-5 rounded-full border border-red-300 px-5 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {cancellingId === reservation._id
      ? "Cancelling..."
      : "Cancel Reservation"}
  </button>
)}
                    <div className="mt-6 grid gap-5 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-[#8b8178]">
                          Event Type
                        </p>

                        <p className="mt-1 font-medium text-[#241914]">
                          {reservation.eventType}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-[#8b8178]">
                          Event Date
                        </p>

                        <p className="mt-1 font-medium text-[#241914]">
                          {new Date(
                            reservation.eventDate
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-[#8b8178]">
                          Location
                        </p>

                        <p className="mt-1 font-medium text-[#241914]">
                          {reservation.eventLocation}
                        </p>
                      </div>
                    </div>

                    {reservation.message && (
                      <div className="mt-6 rounded-xl bg-[#f5f0e8] p-4">
                        <p className="text-xs text-[#8b8178]">
                          Your message
                        </p>

                        <p className="mt-1 text-sm text-[#6b625b]">
                          {reservation.message}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}