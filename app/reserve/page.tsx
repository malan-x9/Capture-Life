import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import ReserveForm from "./ReserveForm";

type ReservePageProps = {
  searchParams: Promise<{
    photographerId?: string;
  }>;
};

export default async function ReservePage({
  searchParams,
}: ReservePageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const photographerId = params.photographerId;

  return (
    <main className="min-h-screen bg-[#f5f0e8] px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.2em] text-[#dd492f]">
          Capture your moments
        </p>

        <h1 className="mt-3 text-5xl font-serif text-[#241914]">
          Reserve a Photographer
        </h1>

        <p className="mt-4 text-[#6b625b]">
          Submit your event details and send a reservation request.
        </p>

        <div className="mt-12">
          {photographerId ? (
            <ReserveForm photographerId={photographerId} />
          ) : (
            <div className="rounded-2xl bg-white p-8 text-[#6b625b]">
              Please select a photographer from the gallery first.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}