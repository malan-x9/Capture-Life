"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
  window.dispatchEvent(new Event("auth-change"));
  router.push("/");
  router.refresh();
}
    } catch (error) {
      console.error("Login request failed:", error);

      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#eeedeb] px-6 py-16">
      <div className="mx-auto max-w-md">

        {/* Heading */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-sans text-[#241914]">
            Welcome back
          </h1>

          <p className="mt-3 text-[#6b625b]">
            Login to your Capture Life account.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-8 shadow-sm"
        >

          {/* Email */}
          <div className="mb-5">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[#241914]"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              required
              className="w-full rounded-xl border border-[#ddd5cc] px-4 py-3 outline-none transition focus:border-[#dd492f]"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-[#241914]"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              className="w-full rounded-xl border border-[#ddd5cc] px-4 py-3 outline-none transition focus:border-[#dd492f]"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#dd492f] px-6 py-3 font-medium text-white transition hover:bg-[#9f3320] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Register */}
          <p className="mt-6 text-center text-sm text-[#6b625b]">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="font-medium text-[#dd492f] hover:underline"
            >
              Create one
            </button>
          </p>

        </form>
      </div>
    </main>
  );
}