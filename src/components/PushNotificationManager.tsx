"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, CheckCircle2 } from "lucide-react";
import { savePushSubscription } from "@/app/actions/notifications";
import { GlassCard } from "./ui/GlassCard";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, []);

  async function checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    } catch (err) {
      console.error("Error checking subscription:", err);
    } finally {
      setLoading(false);
    }
  }

  async function subscribe() {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      
      const res = await savePushSubscription(JSON.parse(JSON.stringify(sub)));
      if (res.success) {
        setSubscription(sub);
      } else {
        console.error("Failed to save subscription:", res.error);
      }
    } catch (err) {
      console.error("Failed to subscribe:", err);
    } finally {
      setLoading(false);
    }
  }

  async function unsubscribe() {
    setLoading(true);
    try {
      if (subscription) {
        await subscription.unsubscribe();
        setSubscription(null);
        // Optionally notify server to delete subscription
      }
    } catch (err) {
      console.error("Failed to unsubscribe:", err);
    } finally {
      setLoading(false);
    }
  }

  if (!isSupported) return null;

  return (
    <GlassCard className="p-4 flex items-center justify-between group">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
          subscription ? "bg-emerald-500/10 text-emerald-500" : "bg-white/5 text-white/60"
        }`}>
          {subscription ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">
            {subscription ? "Notifications Active" : "Push Notifications"}
          </p>
          <p className="text-[10px] text-foreground/40 font-medium uppercase tracking-widest">
            {subscription ? "You're all set!" : "Get workout reminders"}
          </p>
        </div>
      </div>
      
      <button
        onClick={subscription ? unsubscribe : subscribe}
        disabled={loading}
        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all ${
          subscription
            ? "bg-white/5 text-white/40 hover:bg-white/10"
            : "bg-brand-primary text-brand-secondary dark:text-brand-primary hover:opacity-90 active:scale-95"
        }`}
      >
        {loading ? "..." : subscription ? "Turn Off" : "Enable"}
      </button>
    </GlassCard>
  );
}
