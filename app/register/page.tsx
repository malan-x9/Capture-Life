"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "photographer">("customer");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      alert("Account created successfully!");

      router.push("/login");
    } catch (error) {
      console.error("Registration request failed:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#eeedeb] px-6 py-16">
      <div className="mx-auto max-w-md">

        <div className="mb-10 text-center">
          <h1 className="text-4xl font-sans text-[#241914]">
            Create your account
          </h1>

          <p className="mt-3 text-[#6b625b]">
            Join Capture Life and start capturing beautiful moments.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-8 shadow-sm"
        >

          {/* Name */}
          <div className="mb-5">
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-[#241914]"
            >
              Full Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your name"
              required
              className="w-full rounded-xl border border-[#ddd5cc] px-4 py-3 outline-none transition focus:border-[#dd492f]"
            />
          </div>

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
          <div className="mb-5">
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
              placeholder="Create a password"
              required
              minLength={6}
              className="w-full rounded-xl border border-[#ddd5cc] px-4 py-3 outline-none transition focus:border-[#dd492f]"
            />
          </div>

          {/* Role */}
          <div className="mb-6">
            <p className="mb-3 text-sm font-medium text-[#241914]">
              I want to join as
            </p>

            <div className="grid grid-cols-2 gap-3">

              <button
                type="button"
                onClick={() => setRole("customer")}
                className={`rounded-xl border px-4 py-3 text-sm transition ${
                  role === "customer"
                    ? "border-[#dd492f] bg-[#dd492f] text-white"
                    : "border-[#ddd5cc] text-[#241914] hover:border-[#dd492f]"
                }`}
              >
                Customer
              </button>

              <button
                type="button"
                onClick={() => setRole("photographer")}
                className={`rounded-xl border px-4 py-3 text-sm transition ${
                  role === "photographer"
                    ? "border-[#dd492f] bg-[#dd492f] text-white"
                    : "border-[#ddd5cc] text-[#241914] hover:border-[#dd492f]"
                }`}
              >
                Photographer
              </button>

            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#dd492f] px-6 py-3 font-medium text-white transition hover:bg-[#9f3320] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          {/* Login */}
          <p className="mt-6 text-center text-sm text-[#6b625b]">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="font-medium text-[#dd492f] hover:underline"
            >
              Login
            </button>
          </p>

        </form>
      </div>
    </main>
  );
}