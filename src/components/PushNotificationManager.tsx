"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, CheckCircle2, FlaskConical } from "lucide-react";
import {
	savePushSubscription,
	triggerTestNotification,
} from "@/app/actions/notifications";
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
	const [subscription, setSubscription] = useState<PushSubscription | null>(
		null,
	);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const checkSupport = () => {
			return (
				"serviceWorker" in navigator &&
				"PushManager" in window &&
				"Notification" in window
			);
		};

		console.log({ ch: checkSupport() });
		if (checkSupport()) {
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
			console.log([registration, sub]);
			setSubscription(sub);
		} catch (err) {
			console.error("Error checking subscription:", err);
		} finally {
			setLoading(false);
		}
	}

	async function subscribe() {
		console.log({ isSupported });
		if (!isSupported) return;

		setLoading(true);
		try {
			const registration = await navigator.serviceWorker.ready;
			const sub = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
			});

			console.log({ registration, sub });
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

	async function testNotification() {
		setLoading(true);
		try {
			await triggerTestNotification();
		} catch (err) {
			console.error("Test failed:", err);
		} finally {
			setLoading(false);
		}
	}

	if (!isSupported) return null;

	return (
		<div className="space-y-3">
			<GlassCard className="p-4 flex items-center justify-between group">
				<div className="flex items-center gap-4">
					<div
						className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
							subscription
								? "bg-emerald-500/10 text-emerald-500"
								: "bg-white/5 text-white/60"
						}`}>
						{subscription ? (
							<Bell className="w-5 h-5" />
						) : (
							<BellOff className="w-5 h-5" />
						)}
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

				<div className="flex items-center gap-3">
					{loading && (
						<div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
					)}
					<div
						onClick={
							loading ? undefined : subscription ? unsubscribe : subscribe
						}
						className={`relative w-12 h-6 rounded-full cursor-pointer transition-all duration-300 ${
							subscription
								? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
								: "bg-foreground/10"
						} ${loading ? "opacity-50 cursor-wait" : ""}`}>
						<div
							className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${
								subscription ? "translate-x-6" : "translate-x-0"
							}`}
						/>
					</div>
					<span
						className={`text-[10px] font-black uppercase tracking-widest w-8 ${
							subscription ? "text-emerald-500" : "text-foreground/20"
						}`}>
						{subscription ? "On" : "Off"}
					</span>
				</div>
			</GlassCard>

			{subscription && (
				<button
					onClick={testNotification}
					disabled={loading}
					className="w-full glass p-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-foreground transition-all border-dashed border-white/10 border">
					<FlaskConical className="w-3 h-3 text-brand-primary" />
					Send Test Notification
				</button>
			)}
		</div>
	);
}
