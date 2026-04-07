"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";

type Notification = {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  linkTo: string | null;
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then(setNotifications)
      .catch(() => {});

    const interval = setInterval(() => {
      fetch("/api/notifications")
        .then((r) => r.json())
        .then(setNotifications)
        .catch(() => {});
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-muted hover:text-foreground transition"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-danger text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-surface border border-border rounded-xl shadow-2xl z-50 animate-fade-in">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-sm">Bildirimler</h3>
            </div>
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted">
                Bildirim yok
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-border last:border-0 cursor-pointer hover:bg-surface-hover transition ${
                    !n.isRead ? "bg-primary/5" : ""
                  }`}
                  onClick={() => markRead(n.id)}
                >
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted mt-1">{n.body}</p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
