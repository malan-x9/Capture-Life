import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import CustomerDashboard from "./CustomerDashboard";

export default async function CustomerDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "customer") {
    redirect("/dashboard/photographer");
  }

  return <CustomerDashboard />;
}