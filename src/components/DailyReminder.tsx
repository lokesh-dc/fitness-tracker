"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Calendar,
	Clock,
	X,
	ArrowRight,
	CheckCircle2,
	Moon,
	Sun,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getReminderData } from "@/app/actions/plan";
import { useSession } from "next-auth/react";

export function DailyReminder() {
	const pathname = usePathname();
	const { data: session } = useSession();
	const [show, setShow] = useState(false);
	const [data, setData] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (session?.user) {
			checkReminder();
		}
	}, [session]);

	const checkReminder = async () => {
		const todayStr = new Date().toDateString();
		const lastDismissed = localStorage.getItem("last_dismissed_reminder_date");

		if (lastDismissed === todayStr) {
			setLoading(false);
			return;
		}

		try {
			const reminderData = await getReminderData();
			if (reminderData && reminderData.plan) {
				setData(reminderData);
				const hour = new Date().getHours();
				const isNight = hour >= 19;

				if (isNight && reminderData.isLogged) {
					setLoading(false);
					return;
				}

				setShow(true);
			}
		} catch (err) {
			console.error("Error checking reminder:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleDismiss = (permanent = false) => {
		if (permanent) {
			localStorage.setItem(
				"last_dismissed_reminder_date",
				new Date().toDateString(),
			);
		}
		setShow(false);
	};

	if (pathname === "/" || !show || !data || loading) return null;

	const hour = new Date().getHours();
	const isNight = hour >= 19;
	const { plan, isLogged } = data;

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-3 bg-black/40 backdrop-blur-xs">
				<motion.div
					initial={{ opacity: 0, scale: 0.9, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.9, y: 20 }}
					className="bg-white shadow-xl rounded-3xl relative w-full max-w-md overflow-hidden p-0 shadow-2xl ">
					<button
						onClick={() => handleDismiss(false)}
						className="absolute right-[10px] top-[10px] p-1 rounded-full hover:bg-foreground/5 transition-colors text-black/40">
						<X className="w-5 h-5" />
					</button>
					<div className="p-5">
						<div className="flex justify-between items-center">
							<div
								className={`p-3 rounded-2xl ${isNight ? "bg-indigo-500/10" : "bg-brand-primary/10"}`}>
								{isNight ? (
									<Moon className="w-6 h-6 text-indigo-500" />
								) : (
									<Sun className="w-6 h-6 text-brand-primary" />
								)}
							</div>
						</div>

						<h2 className="text-2xl font-bold text-black mb-2 tracking-tight">
							{isNight
								? isLogged
									? "Great work today!"
									: "Don't skip the log!"
								: "Today's Plan is ready!"}
						</h2>
						<p className="text-black/60 text-sm mb-3 leading-relaxed">
							{isNight
								? isLogged
									? "You've completed your workout. Sleep well and recover!"
									: "It's late! Don't forget to log your exercises for today to keep your streak alive."
								: "Your scheduled workout is waiting. Let's make today count!"}
						</p>

						<div className="glass-card bg-foreground/5 border-foreground/5 p-4 mb-8">
							<div className="flex items-center space-x-3">
								<div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center">
									<Clock className="w-5 h-5 text-brand-primary" />
								</div>
								<div>
									<h3 className="text-sm font-bold text-foreground">
										{plan.dayOfWeek === 0
											? "Rest Day"
											: `Day ${plan.dayOfWeek}: Strength Training`}
									</h3>
									<p className="text-[11px] text-foreground/40 font-medium uppercase tracking-wider">
										{plan.exercises.length} Exercises • 60 min session
									</p>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-3 mb-3">
							<button
								onClick={() => handleDismiss(false)}
								className="px-4 py-3 rounded-2xl border border-foreground/10 text-sm font-bold text-black/60 hover:bg-black/5 transition-all text-center">
								Remind me later
							</button>

							<Link
								href="/workout"
								onClick={() => handleDismiss(true)}
								className={`px-4 py-3 rounded-2xl text-sm font-bold text-white flex items-center justify-center space-x-2 transition-all shadow-lg ${isNight ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20" : "bg-brand-primary hover:bg-brand-secondary shadow-brand-primary/20"}`}>
								<span>{isNight ? "Log Now" : "Take me there"}</span>
								<ArrowRight className="w-4 h-4 ml-1" />
							</Link>
						</div>

						<button
							onClick={() => handleDismiss(true)}
							className="w-full py-2 text-xs font-semibold text-black/30 hover:text-foreground/60 hover:underline transition-all text-center">
							Okay, don&apos;t show this again today
						</button>
					</div>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}
