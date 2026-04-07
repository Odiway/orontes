"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";

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
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, []);

  async function fetchNotifs() {
    try {
      const r = await fetch("/api/notifications");
      if (r.ok) {
        const data = await r.json();
        setNotifications(data);
      }
    } catch {
      // ignore
    }
  }

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

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "az önce";
    if (mins < 60) return `${mins}dk`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}sa`;
    return `${Math.floor(hours / 24)}g`;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2.5 text-muted hover:text-foreground transition rounded-xl hover:bg-surface"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto glass border border-border rounded-2xl shadow-2xl z-50 animate-scale-in">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-bold text-sm">Bildirimler</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-muted hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-muted/30 mx-auto mb-2" />
                <p className="text-sm text-muted">Bildirim yok</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-border last:border-0 cursor-pointer hover:bg-surface-hover transition ${
                    !n.isRead ? "bg-primary/5 border-l-2 border-l-primary" : ""
                  }`}
                  onClick={() => markRead(n.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-tight">
                      {n.title}
                    </p>
                    <span className="text-[10px] text-muted whitespace-nowrap">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    {n.body}
                  </p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
