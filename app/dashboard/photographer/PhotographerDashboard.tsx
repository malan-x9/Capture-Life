"use client";

import { useEffect, useState } from "react";

type Reservation = {
  _id: string;
  eventDate: string;
  eventType: string;
  eventLocation: string;
  message?: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  customerId?: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
};

export default function PhotographerDashboardPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [message, setMessage] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
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

  useEffect(() => {
    fetchReservations();
  }, []);

  async function updateReservation(
    reservationId: string,
    status: "accepted" | "rejected" | "completed"
  ) {
    try {
      setUpdatingId(reservationId);
      setMessage("");

      const response = await fetch(
        `/api/reservations/${reservationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to update reservation");
        return;
      }

      setReservations((currentReservations) =>
        currentReservations.map((reservation) =>
          reservation._id === reservationId
            ? { ...reservation, status }
            : reservation
        )
      );

      setMessage(`Reservation ${status} successfully.`);
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while updating reservation");
    } finally {
      setUpdatingId("");
    }
  }

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
          Loading reservation requests...
        </p>
      </main>
    );
  }
  async function handleAvailabilityChange() {
  const newAvailability = !isAvailable;

  setUpdatingAvailability(true);

  try {
    const response = await fetch("/api/photographers/availability", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isAvailable: newAvailability,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to update availability");
      return;
    }

    setIsAvailable(newAvailability);
    alert(data.message);
  } catch (error) {
    console.error("Availability update error:", error);
    alert("Something went wrong while updating availability");
  } finally {
    setUpdatingAvailability(false);
  }
}

  return (
    <main className="min-h-screen bg-[#f5f0e8] px-6 py-16">
      
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm sm:flex-row sm:items-center">
  <div>
    <h2 className="text-xl font-semibold text-[#241914]">
      Photographer Availability
    </h2>

    <p className="mt-1 text-sm text-[#6b625b]">
      Control whether customers can send you new reservation requests.
    </p>
  </div>

  <button
    onClick={handleAvailabilityChange}
    disabled={updatingAvailability}
    className={`rounded-full px-6 py-3 text-sm font-medium text-white transition ${
      isAvailable
        ? "bg-green-600 hover:bg-green-700"
        : "bg-gray-500 hover:bg-gray-600"
    } disabled:cursor-not-allowed disabled:opacity-60`}
  >
    {updatingAvailability
      ? "Updating..."
      : isAvailable
        ? "Available"
        : "Unavailable"}
  </button>
</div>
        <p className="text-sm uppercase tracking-[0.2em] text-[#dd492f]">
          Photographer Dashboard
        </p>

        <h1 className="mt-3 text-5xl font-serif text-[#241914]">
          Reservation Requests
        </h1>

        <p className="mt-4 text-[#6b625b]">
          Manage customers who want to book your photography services.
        </p>

        {message && (
          <p className="mt-8 rounded-xl bg-[#e8dfd4] p-4 text-[#6b625b]">
            {message}
          </p>
        )}

        {reservations.length === 0 && !message && (
          <div className="mt-10 rounded-2xl bg-white p-10 text-center">
            <h2 className="text-2xl font-serif text-[#241914]">
              No reservation requests
            </h2>

            <p className="mt-3 text-[#6b625b]">
              New customer requests will appear here.
            </p>
          </div>
        )}

        <div className="mt-10 space-y-6">
          {reservations.map((reservation) => (
            <div
              key={reservation._id}
              className="rounded-2xl bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-serif text-[#241914]">
                    {reservation.customerId?.name ||
                      "Unknown customer"}
                  </h2>

                  <p className="mt-1 text-sm text-[#6b625b]">
                    {reservation.customerId?.email}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusStyle(
                    reservation.status
                  )}`}
                >
                  {reservation.status}
                </span>
              </div>

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
                    Event Location
                  </p>

                  <p className="mt-1 font-medium text-[#241914]">
                    {reservation.eventLocation}
                  </p>
                </div>
              </div>

              {reservation.message && (
                <div className="mt-6 rounded-xl bg-[#f5f0e8] p-4">
                  <p className="text-xs text-[#8b8178]">
                    Customer Message
                  </p>

                  <p className="mt-1 text-sm text-[#6b625b]">
                    {reservation.message}
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                {reservation.status === "pending" && (
                  <>
                    <button
                      type="button"
                      disabled={updatingId === reservation._id}
                      onClick={() =>
                        updateReservation(
                          reservation._id,
                          "accepted"
                        )
                      }
                      className="rounded-full bg-green-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      Accept
                    </button>

                    <button
                      type="button"
                      disabled={updatingId === reservation._id}
                      onClick={() =>
                        updateReservation(
                          reservation._id,
                          "rejected"
                        )
                      }
                      className="rounded-full bg-red-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                )}

                {reservation.status === "accepted" && (
                  <button
                    type="button"
                    disabled={updatingId === reservation._id}
                    onClick={() =>
                      updateReservation(
                        reservation._id,
                        "completed"
                      )
                    }
                    className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}