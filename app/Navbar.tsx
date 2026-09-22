"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "photographer";
  profileImage?: string;
};

type Notification = {
  _id: string;
  type: string;
  message: string;
  reservationId?: string;
  read: boolean;
  createdAt: string;
};

export default function Navbar() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);

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
          setNotifications([]);
          setUnreadCount(0);
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchCurrentUser();

    window.addEventListener("auth-change", fetchCurrentUser);

    return () => {
      window.removeEventListener("auth-change", fetchCurrentUser);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    async function fetchNotifications() {
      try {
        const response = await fetch("/api/notifications", {
          cache: "no-store",
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    }

    fetchNotifications();

    // Keep the notification badge updated without refreshing the page.
    const interval = window.setInterval(fetchNotifications, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleNotificationClick(notification: Notification) {
    try {
      if (!notification.read) {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notificationId: notification._id,
          }),
        });

        setNotifications((current) =>
          current.map((item) =>
            item._id === notification._id
              ? { ...item, read: true }
              : item
          )
        );

        setUnreadCount((current) => Math.max(0, current - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }

    setShowNotifications(false);

    if (notification.reservationId) {
      router.push(
        user?.role === "photographer"
          ? "/dashboard/photographer"
          : "/dashboard/customer"
      );
    }
  }

  async function handleMarkAllAsRead() {
    if (unreadCount === 0) {
      return;
    }

    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "PATCH",
      });

      if (response.ok) {
        setNotifications((current) =>
          current.map((notification) => ({
            ...notification,
            read: true,
          }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      setUser(null);
      setNotifications([]);
      setUnreadCount(0);
      setShowNotifications(false);
      setIsMenuOpen(false);

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  function formatNotificationDate(date: string) {
    const notificationDate = new Date(date);

    return notificationDate.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const dashboardLink =
    user?.role === "photographer"
      ? "/dashboard/photographer"
      : "/dashboard/customer";

  return (
    <header className="static border-b border-[#eeedeb] bg-[#eeedeb] shadow-[0_18px_45px_rgba(36,25,20,0.14)] transition-shadow duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          onClick={() => setIsMenuOpen(false)}
          className="text-2xl font-sans font-semibold tracking-tight text-[#241914]"
        >
          Capture<span className="text-[#dd492f]">Life</span>
        </Link>

        {/* Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-sans font-medium text-[#575554] transition hover:text-[#dd492f]"
          >
            Home
          </Link>

          <Link
            href="/gallery"
            className="text-sm font-sans font-medium text-[#575554] transition hover:text-[#dd492f]"
          >
            Find Photographers
          </Link>

          {user && (
            <Link
              href={dashboardLink}
              className="text-sm font-sans font-medium text-[#575554] transition hover:text-[#dd492f]"
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {loading ? (
            <span className="text-sm text-[#8b8178]">Loading...</span>
          ) : user ? (
            <>
              {/* Notification Bell */}
              <div ref={notificationRef} className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setShowNotifications((current) => !current)
                  }
                  aria-label="Notifications"
                  aria-expanded={showNotifications}
                  className={`relative flex h-11 w-11 items-center justify-center rounded-full border transition ${
                    showNotifications
                      ? "border-[#dd492f] bg-[#fff8f2] text-[#dd492f] shadow-sm"
                      : "border-transparent text-[#6b625b] hover:border-[#e8ded2] hover:bg-white hover:text-[#dd492f]"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 17H9m9-2V11a6 6 0 10-12 0v4l-1.5 2h15L18 15z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 20h4"
                    />
                  </svg>

                  {/* Unread badge */}
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex min-h-[19px] min-w-[19px] items-center justify-center rounded-full bg-[#dd492f] px-1 text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-[#eeedeb]">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[350px] overflow-hidden rounded-2xl border border-[#e8ded2] bg-white shadow-[0_18px_45px_rgba(36,25,20,0.14)]">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#eee6dc] px-5 py-4">
                      <div>
                        <h3 className="text-base font-sans font-semibold text-[#241914]">
                          Notifications
                        </h3>
                        <p className="mt-0.5 text-xs font-sans text-[#8b8178]">
                          {unreadCount > 0
                            ? `${unreadCount} unread`
                            : "You're all caught up"}
                        </p>
                      </div>

                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllAsRead}
                          className="rounded-full font-sans px-3 py-1.5 text-xs font-semibold text-[#dd492f] transition hover:bg-[#fff3ed]"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Notifications */}
                    <div className="max-h-95 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-6 py-10 text-center">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f1e9] text-[#8b8178]">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.7"
                              className="h-5 w-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 17H9m9-2V11a6 6 0 10-12 0v4l-1.5 2h15L18 15z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10 20h4"
                              />
                            </svg>
                          </div>

                          <p className="mt-3 text-sm font-medium text-[#241914]">
                            No notifications
                          </p>
                          <p className="mt-1 text-xs font-sans text-[#8b8178]">
                            New reservation updates will appear here.
                          </p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <button
                            key={notification._id}
                            type="button"
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                            className={`group flex w-full gap-3 border-b border-[#f1ebe4] px-5 py-4 text-left transition last:border-b-0 hover:bg-[#fff9f5] ${
                              !notification.read ? "bg-[#fffaf7]" : "bg-white"
                            }`}
                          >
                            {/* Status dot */}
                            <div className="pt-1.5">
                              <span
                                className={`block h-2.5 w-2.5 rounded-full ${
                                  notification.read
                                    ? "bg-[#ded5cc]"
                                    : "bg-[#dd492f] shadow-[0_0_0_4px_rgba(221,73,47,0.08)]"
                                }`}
                              />
                            </div>

                            <div className="min-w-0 font-sans flex-1">
                              <p
                                className={`text-sm leading-5 ${
                                  notification.read
                                    ? "font-medium text-[#6b625b]"
                                    : "font-semibold text-[#241914]"
                                }`}
                              >
                                {notification.message}
                              </p>

                              <p className="mt-1.5 text-[11px] text-[#a0958b]">
                                {formatNotificationDate(
                                  notification.createdAt
                                )}
                              </p>
                            </div>

                            <span className="pt-1 text-[#c1b6ac] opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100">
                              →
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <Link
                href={
                  user.role === "photographer"
                    ? "/photographers/profile"
                    : "/dashboard/customer"
                }
                className="group flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-white"
                title="View profile"
              >
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-[#dd492f]/15"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8dfd4] text-sm font-semibold text-[#6b625b]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <span className="hidden max-w-[160px] truncate text-sm font-medium text-[#6b625b] sm:block font-sans">
                  Hi, {user.name}
                </span>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="hidden font-sans rounded-full border border-[#dd492f] px-5 py-2.5 text-sm font-medium text-[#dd492f] transition hover:bg-[#dd492f] hover:text-white md:inline-block"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full px-5 py-2.5 text-sm font-medium text-[#6b625b] transition hover:text-[#dd492f] md:inline-block"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="hidden rounded-full bg-[#dd492f] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#b93624] md:inline-block"
              >
                Get Started
              </Link>
            </>
          )}

          {/* Hamburger (mobile only) */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            className="relative flex h-9 w-9 flex-col items-center justify-center gap-[5px] md:hidden"
          >
            <span
              className={`h-[2px] w-5 bg-[#241914] transition-transform duration-300 ${
                isMenuOpen ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-[2px] w-5 bg-[#241914] transition-opacity duration-300 ${
                isMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`h-[2px] w-5 bg-[#241914] transition-transform duration-300 ${
                isMenuOpen ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile dropdown panel */}
      <div
        className={`overflow-hidden border-t border-[#e8ded2] bg-[#eeedeb] transition-[max-height] duration-300 ease-in-out md:hidden ${
          isMenuOpen ? "max-h-96" : "max-h-0 border-t-0"
        }`}
      >
        <div className="flex flex-col gap-1 px-6 py-4">
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#6b625b] transition hover:bg-white hover:text-[#dd492f]"
          >
            Home
          </Link>

          <Link
            href="/gallery"
            onClick={() => setIsMenuOpen(false)}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#6b625b] transition hover:bg-white hover:text-[#dd492f]"
          >
            Find Photographers
          </Link>

          {user && (
            <Link
              href={dashboardLink}
              onClick={() => setIsMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#6b625b] transition hover:bg-white hover:text-[#dd492f]"
            >
              Dashboard
            </Link>
          )}

          {!loading && !user && (
            <div className="mt-2 flex flex-col gap-2 border-t border-[#eee6dc] pt-3">
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-full px-3 py-2.5 text-center text-sm font-medium text-[#6b625b] transition hover:text-[#dd492f]"
              >
                Login
              </Link>

              <Link
                href="/register"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-full bg-[#dd492f] px-3 py-2.5 text-center text-sm font-medium text-white transition hover:bg-[#b93624]"
              >
                Get Started
              </Link>
            </div>
          )}

          {user && (
            <button
              onClick={() => {
                setIsMenuOpen(false);
                handleLogout();
              }}
              className="mt-2 rounded-full border border-[#dd492f] px-3 py-2.5 text-center text-sm font-medium text-[#dd492f] transition hover:bg-[#dd492f] hover:text-white"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}