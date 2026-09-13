"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "photographer";
};

export default function Navbar() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function fetchCurrentUser() {
    try {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  // Check user when Navbar first loads
  fetchCurrentUser();

  // Check user again whenever login/register/logout happens
  window.addEventListener("auth-change", fetchCurrentUser);

  return () => {
    window.removeEventListener("auth-change", fetchCurrentUser);
  };
}, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      setUser(null);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  const dashboardLink =
    user?.role === "photographer"
      ? "/dashboard/photographer"
      : "/dashboard/customer";

  return (
    <nav className="border-b border-[#e8ded2] bg-[#f5f0e8]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-semibold tracking-tight text-[#241914]"
        >
          Capture<span className="text-[#dd492f]">Life</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm text-[#6b625b] transition hover:text-[#dd492f]"
          >
            Home
          </Link>

          <Link
            href="/gallery"
            className="text-sm text-[#6b625b] transition hover:text-[#dd492f]"
          >
            Find Photographers
          </Link>

          {user && (
            <Link
              href={dashboardLink}
              className="text-sm text-[#6b625b] transition hover:text-[#dd492f]"
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Auth Actions */}
        <div className="flex items-center gap-3">
          {loading ? (
            <span className="text-sm text-[#8b8178]">Loading...</span>
          ) : user ? (
            <>
              <span className="hidden text-sm text-[#6b625b] sm:block">
                Hi, {user.name}
              </span>

              <button
                onClick={handleLogout}
                className="rounded-full border border-[#dd492f] px-5 py-2 text-sm font-medium text-[#dd492f] transition hover:bg-[#dd492f] hover:text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-5 py-2 text-sm font-medium text-[#6b625b] transition hover:text-[#dd492f]"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-full bg-[#dd492f] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#b93624]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}