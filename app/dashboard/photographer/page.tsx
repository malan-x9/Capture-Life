import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import PhotographerDashboard from "./PhotographerDashboard";

export default async function PhotographerDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "photographer") {
    redirect("/dashboard/customer");
  }

  return <PhotographerDashboard />;
}