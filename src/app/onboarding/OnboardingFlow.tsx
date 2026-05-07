"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Dumbbell } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassSlider } from "@/components/ui/GlassSlider";
import { saveOnboardingStep } from "@/app/actions/profile";
import { UserProfile } from "@/types/profile";
import { cn } from "@/lib/utils";

interface OnboardingFlowProps {
	initialData: Partial<UserProfile> | null;
}

const STEPS = [
	"About You",
	"Target Weight",
	"Timeline",
	"Training Schedule",
	"Summary",
];

export default function OnboardingFlow({ initialData }: OnboardingFlowProps) {
	const router = useRouter();
	const [currentStep, setCurrentStep] = useState(0);
	const [direction, setDirection] = useState(0); // 1 for next, -1 for back
	const [isSubmitting, setIsSubmitting] = useState(false);

	// State for all steps
	const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">(
		initialData?.unit || "kg",
	);
	const [heightUnit, setHeightUnit] = useState<"cm" | "ft">(
		initialData?.unit === "lbs" ? "ft" : "cm",
	);
	const [currentWeight, setCurrentWeight] = useState(
		initialData?.currentWeight || 70,
	); // stored in kg
	const [height, setHeight] = useState(initialData?.height || 170); // stored in cm
	const [targetWeight, setTargetWeight] = useState(
		initialData?.targetWeight || initialData?.currentWeight || 70,
	);
	const [targetTimeline, setTargetTimeline] = useState<"1m" | "3m" | "1y">(
		initialData?.targetTimeline || "3m",
	);
	const [preferredTrainingDays, setPreferredTrainingDays] = useState<number[]>(
		initialData?.preferredTrainingDays || [1, 3, 5],
	);
	const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState(
		initialData?.preferredTrainingDays?.length || 3,
	);

	// Unit Conversion Helpers
	const kgToLbs = (kg: number) => Math.round(kg * 2.20462 * 10) / 10;
	const lbsToKg = (lbs: number) => Math.round((lbs / 2.20462) * 100) / 100;

	const cmToFt = (cm: number) => Math.round((cm / 30.48) * 10) / 10;
	const ftToCm = (ft: number) => Math.round(ft * 30.48 * 10) / 10;

	const cmToFtIn = (cm: number) => {
		const totalInches = cm / 2.54;
		const feet = Math.floor(totalInches / 12);
		const inches = Math.round(totalInches % 12);
		return `${feet}'${inches}"`;
	};

	const handleNext = async (data?: Partial<UserProfile>) => {
		if (data) {
			setIsSubmitting(true);
			await saveOnboardingStep({ ...data, unit: weightUnit });
			setIsSubmitting(false);
		}
		setDirection(1);
		setCurrentStep((prev) => prev + 1);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleSkip = async () => {
		setIsSubmitting(true);
		await saveOnboardingStep({ onboardingComplete: true });
		router.push("/plan/new");
	};

	const handleBack = () => {
		setDirection(-1);
		setCurrentStep((prev) => prev - 1);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleFinish = async () => {
		setIsSubmitting(true);
		await saveOnboardingStep({ onboardingComplete: true });
		router.push("/plan/new");
	};

	useEffect(() => {
		const suggestions: Record<number, number[]> = {
			1: [3],
			2: [1, 4],
			3: [1, 3, 5],
			4: [1, 2, 4, 5],
			5: [1, 2, 3, 4, 5],
			6: [1, 2, 3, 4, 5, 6],
			7: [0, 1, 2, 3, 4, 5, 6],
		};
		setPreferredTrainingDays(suggestions[trainingDaysPerWeek]);
	}, [trainingDaysPerWeek]);

	const toggleDay = (day: number) => {
		setPreferredTrainingDays((prev) =>
			prev.includes(day)
				? prev.filter((d) => d !== day)
				: [...prev, day].sort(),
		);
	};

	const variants = {
		enter: (direction: number) => ({
			x: direction > 0 ? 500 : -500,
			opacity: 0,
		}),
		center: { x: 0, opacity: 1 },
		exit: (direction: number) => ({
			x: direction < 0 ? 500 : -500,
			opacity: 0,
		}),
	};

	const progressColor = currentStep === 4 ? "bg-green-500" : "bg-orange-500";
	const progressBaseColor =
		currentStep === 4 ? "bg-green-500/50" : "bg-orange-500/50";

	return (
		<div className="min-h-[100dvh] bg-background flex flex-col items-center">
			<div className="pt-8 pb-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-1000">
				<div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
					<Dumbbell className="w-4 h-4 text-black stroke-[3px]" />
				</div>
				<span className="text-[18px] font-black uppercase tracking-[0.2em] text-white italic">
					FitTrack
				</span>
			</div>

			<div className="w-full max-w-[480px] flex-1 flex flex-col px-4 relative">
				<div className="flex-1 flex flex-col pt-4 pb-44 gap-6">
					<div className="flex gap-1.5 h-1 px-1">
						{STEPS.map((_, idx) => (
							<div
								key={idx}
								className={cn(
									"flex-1 rounded-full transition-all duration-500",
									idx < currentStep
										? progressColor
										: idx === currentStep
											? progressBaseColor
											: "bg-white/10",
								)}
							/>
						))}
					</div>

					<AnimatePresence mode="wait" custom={direction}>
						<motion.div
							key={currentStep}
							custom={direction}
							variants={variants}
							initial="enter"
							animate="center"
							exit="exit"
							transition={{ type: "spring", stiffness: 300, damping: 30 }}
							className="w-full">
							<GlassCard className="space-y-8 border-white/5">
								{currentStep === 0 && (
									<div className="space-y-8">
										<Header
											title="Let's start with you"
											subtitle="We'll use this to personalise your experience"
										/>
										<div className="space-y-6">
											<div className="flex justify-between items-center px-2">
												<span className="text-xs font-black text-white/20 uppercase tracking-widest">
													Weight Unit
												</span>
												<div className="bg-white/5 p-1 rounded-xl flex gap-1">
													{(["kg", "lbs"] as const).map((u) => (
														<button
															key={u}
															onClick={() => setWeightUnit(u)}
															className={cn(
																"px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
																weightUnit === u
																	? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
																	: "text-white/40 hover:text-white",
															)}>
															{u}
														</button>
													))}
												</div>
											</div>
											<GlassSlider
												min={weightUnit === "kg" ? 40 : 88}
												max={weightUnit === "kg" ? 200 : 441}
												step={weightUnit === "kg" ? 0.5 : 1}
												value={
													weightUnit === "kg"
														? currentWeight
														: kgToLbs(currentWeight)
												}
												onChange={(v) =>
													setCurrentWeight(weightUnit === "kg" ? v : lbsToKg(v))
												}
												displayValue={`${weightUnit === "kg" ? currentWeight : kgToLbs(currentWeight)} ${weightUnit}`}
												label="Current Weight"
												unit={weightUnit}
											/>
										</div>
										<div className="h-[1px] bg-white/5 mx-2" />
										<div className="space-y-6">
											<div className="flex justify-between items-center px-2">
												<span className="text-xs font-black text-white/20 uppercase tracking-widest">
													Height Unit
												</span>
												<div className="bg-white/5 p-1 rounded-xl flex gap-1">
													{(["cm", "ft"] as const).map((u) => (
														<button
															key={u}
															onClick={() => setHeightUnit(u)}
															className={cn(
																"px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
																heightUnit === u
																	? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
																	: "text-white/40 hover:text-white",
															)}>
															{u}
														</button>
													))}
												</div>
											</div>
											<GlassSlider
												min={heightUnit === "cm" ? 140 : 4.5}
												max={heightUnit === "cm" ? 220 : 7.5}
												step={heightUnit === "cm" ? 1 : 0.1}
												value={heightUnit === "cm" ? height : cmToFt(height)}
												onChange={(v) =>
													setHeight(heightUnit === "cm" ? v : ftToCm(v))
												}
												displayValue={
													heightUnit === "cm"
														? `${height} cm`
														: cmToFtIn(height)
												}
												label="Height"
												unit={heightUnit}
											/>
										</div>
										<div className="hidden md:block">
											<Footer
												onContinue={() => handleNext({ currentWeight, height })}
												onSkip={handleSkip}
												isSubmitting={isSubmitting}
											/>
										</div>
									</div>
								)}

								{currentStep === 1 && (
									<div className="space-y-8">
										<Header
											title="What's your goal weight?"
											subtitle="Drag the slider or type — we'll figure out the rest"
										/>
										<div className="space-y-6">
											<GlassSlider
												min={weightUnit === "kg" ? 40 : 88}
												max={weightUnit === "kg" ? 200 : 441}
												step={weightUnit === "kg" ? 0.5 : 1}
												value={
													weightUnit === "kg"
														? targetWeight
														: kgToLbs(targetWeight)
												}
												onChange={(v) =>
													setTargetWeight(weightUnit === "kg" ? v : lbsToKg(v))
												}
												displayValue={`${weightUnit === "kg" ? targetWeight : kgToLbs(targetWeight)} ${weightUnit}`}
												label="Target Weight"
												unit={weightUnit}
											/>
											<div className="text-center py-4 px-6 bg-white/5 rounded-2xl border border-white/5">
												{targetWeight > currentWeight && (
													<span className="text-emerald-400 font-bold flex items-center justify-center gap-2">
														📈 Target: Gain Weight
													</span>
												)}
												{targetWeight < currentWeight && (
													<span className="text-rose-400 font-bold flex items-center justify-center gap-2">
														📉 Target: Lose Weight
													</span>
												)}
												{targetWeight === currentWeight && (
													<span className="text-sky-400 font-bold flex items-center justify-center gap-2">
														⚖️ Target: Maintain Weight
													</span>
												)}
											</div>
										</div>
										<div className="hidden md:block">
											<Footer
												onContinue={() => handleNext({ targetWeight })}
												onSkip={handleSkip}
												isSubmitting={isSubmitting}
												onBack={handleBack}
											/>
										</div>
									</div>
								)}

								{currentStep === 2 && (
									<div className="space-y-8">
										<Header
											title="How soon do you want to get there?"
											subtitle="Pick a realistic timeframe"
										/>
										<div className="grid grid-cols-1 gap-4">
											{(["1m", "3m", "1y"] as const).map((t) => (
												<button
													key={t}
													onClick={() => setTargetTimeline(t)}
													className={cn(
														"w-full h-20 rounded-2xl border-2 flex items-center justify-between px-6 transition-all group",
														targetTimeline === t
															? "border-orange-500 bg-orange-500/10 text-white"
															: "border-white/5 bg-white/5 text-white/40 hover:bg-white/10",
													)}>
													<div className="flex flex-col items-start">
														<span
															className={cn(
																"text-lg font-black uppercase tracking-wider",
																targetTimeline === t
																	? "text-white"
																	: "text-white/60",
															)}>
															{t === "1m"
																? "1 Month"
																: t === "3m"
																	? "3 Months"
																	: "1 Year"}
														</span>
														<span className="text-[10px] text-white/30 font-bold uppercase tracking-widest group-hover:text-white/50 transition-colors">
															{t === "1m"
																? "Short term sprint"
																: t === "3m"
																	? "Steady progress"
																	: "Lifestyle transformation"}
														</span>
													</div>
													<div
														className={cn(
															"w-6 h-6 rounded-full border-2 flex items-center justify-center",
															targetTimeline === t
																? "border-orange-500 bg-orange-500"
																: "border-white/10",
														)}>
														{targetTimeline === t && (
															<div className="w-2 h-2 bg-white rounded-full" />
														)}
													</div>
												</button>
											))}
										</div>
										<div className="hidden md:block">
											<Footer
												onContinue={() => handleNext({ targetTimeline })}
												onSkip={handleSkip}
												isSubmitting={isSubmitting}
												onBack={handleBack}
											/>
										</div>
									</div>
								)}

								{currentStep === 3 && (
									<div className="space-y-10">
										<Header
											title="How often can you train?"
											subtitle="We'll build your schedule around this"
										/>
										<GlassSlider
											min={1}
											max={7}
											step={1}
											value={trainingDaysPerWeek}
											onChange={setTrainingDaysPerWeek}
											displayValue={`${trainingDaysPerWeek} days / week`}
											label="Training Frequency"
											unit="days"
										/>
										<div className="space-y-4">
											<div className="flex justify-between items-center px-1">
												<span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
													Select Preferred Days
												</span>
												<span className="text-[10px] font-black text-orange-500/60 uppercase tracking-[0.2em]">
													{preferredTrainingDays.length} / 7
												</span>
											</div>
											<div className="flex justify-between gap-2">
												{["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
													<button
														key={`${day}-${idx}`}
														onClick={() => toggleDay(idx)}
														className={cn(
															"flex-1 aspect-square rounded-xl text-xs font-black transition-all border-2",
															preferredTrainingDays.includes(idx)
																? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20"
																: "bg-white/5 border-white/5 text-white/30 hover:bg-white/10",
														)}>
														{day}
													</button>
												))}
											</div>
										</div>
										<div className="hidden md:block">
											<Footer
												onContinue={() => handleNext({ preferredTrainingDays })}
												onSkip={handleSkip}
												isSubmitting={isSubmitting}
												onBack={handleBack}
											/>
										</div>
									</div>
								)}

								{currentStep === 4 && (
									<div className="space-y-8">
										<Header
											title="You're all set 🎉"
											subtitle="Here's what we've got for you"
										/>
										<div className="space-y-3 bg-white/5 rounded-3xl p-6 border border-white/5">
											<SummaryRow
												label="Current Weight"
												value={`${weightUnit === "kg" ? currentWeight : kgToLbs(currentWeight)} ${weightUnit}`}
											/>
											<SummaryRow
												label="Height"
												value={
													heightUnit === "cm"
														? `${height} cm`
														: cmToFtIn(height)
												}
											/>
											<SummaryRow
												label="Goal"
												value={
													targetWeight > currentWeight
														? "Gain weight"
														: targetWeight < currentWeight
															? "Lose weight"
															: "Maintain weight"
												}
											/>
											<SummaryRow
												label="Target Weight"
												value={`${weightUnit === "kg" ? targetWeight : kgToLbs(targetWeight)} ${weightUnit}`}
											/>
											<SummaryRow
												label="Timeline"
												value={
													targetTimeline === "1m"
														? "1 Month"
														: targetTimeline === "3m"
															? "3 Months"
															: "1 Year"
												}
											/>
											<div className="flex justify-between items-center py-3">
												<span className="text-white/30 text-[10px] font-black uppercase tracking-widest">
													Training Days
												</span>
												<div className="flex gap-1">
													{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(
														(day, idx) =>
															preferredTrainingDays.includes(idx) && (
																<span
																	key={day}
																	className="text-[8px] bg-orange-500/20 border border-orange-500/30 px-1.5 py-0.5 rounded text-orange-500 font-black uppercase tracking-tighter">
																	{day}
																</span>
															),
													)}
												</div>
											</div>
										</div>

										<div className="hidden md:block pt-4">
											<button
												onClick={handleFinish}
												disabled={isSubmitting}
												className="w-full h-16 bg-green-500 text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all disabled:opacity-50">
												{isSubmitting ? "Finalising..." : "Let's Go 🚀"}
											</button>
										</div>
									</div>
								)}
							</GlassCard>
						</motion.div>
					</AnimatePresence>
				</div>

				{/* Sticky Mobile Footer with Smoother Blur */}
				<div className="md:hidden fixed bottom-0 left-0 right-0 p-6 pt-24 z-50 pointer-events-none">
					<div
						className="absolute inset-0 bg-background/40 backdrop-blur-xl"
						style={{
							maskImage: "linear-gradient(to top, black 60%, transparent 100%)",
							WebkitMaskImage:
								"linear-gradient(to top, black 60%, transparent 100%)",
						}}
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

					<div className="max-w-[480px] mx-auto relative pointer-events-auto">
						{currentStep < 4 ? (
							<Footer
								onContinue={() => {
									if (currentStep === 0) handleNext({ currentWeight, height });
									else if (currentStep === 1) handleNext({ targetWeight });
									else if (currentStep === 2) handleNext({ targetTimeline });
									else if (currentStep === 3)
										handleNext({ preferredTrainingDays });
								}}
								onSkip={handleSkip}
								isSubmitting={isSubmitting}
								onBack={currentStep > 0 ? handleBack : undefined}
							/>
						) : (
							<button
								onClick={handleFinish}
								disabled={isSubmitting}
								className="w-full h-16 bg-green-500 text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-green-500/20 active:scale-[0.98] transition-all disabled:opacity-50">
								{isSubmitting ? "Finalising..." : "Let's Go 🚀"}
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
	return (
		<div className="text-center space-y-3">
			<h1 className="text-3xl font-black text-white uppercase tracking-tight leading-none">
				{title}
			</h1>
			<p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-relaxed">
				{subtitle}
			</p>
		</div>
	);
}

function Footer({
	onContinue,
	onSkip,
	isSubmitting,
	onBack,
}: {
	onContinue: () => void;
	onSkip: () => void;
	isSubmitting: boolean;
	onBack?: () => void;
}) {
	return (
		<div className="space-y-6">
			<button
				onClick={onContinue}
				disabled={isSubmitting}
				className="w-full h-16 bg-orange-500 text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-all disabled:opacity-50">
				{isSubmitting ? "Saving..." : "Continue"}
			</button>
			<div className="flex items-center justify-center gap-8">
				{onBack && (
					<button
						onClick={onBack}
						className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white/40 transition-colors">
						Go Back
					</button>
				)}
				<button
					onClick={onSkip}
					className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors">
					Skip for now
				</button>
			</div>
		</div>
	);
}

function SummaryRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
			<span className="text-white/30 text-[10px] font-black uppercase tracking-widest">
				{label}
			</span>
			<span className="text-white font-bold text-sm tracking-tight">
				{value || "—"}
			</span>
		</div>
	);
}
