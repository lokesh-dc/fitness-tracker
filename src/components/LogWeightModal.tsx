"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Scale, X, Check, Loader2, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import { WeekDayWeight } from "@/types/workout";
import { saveBodyWeight } from "@/app/actions/logs";
import { useRouter } from "next/navigation";

const ITEM_HEIGHT = 44;
const WHOLE_KG = Array.from({ length: 171 }, (_, i) => 30 + i); // 30 to 200 kg
const TENTHS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export function AppleWeightWheelPicker({
	value,
	onChange,
}: {
	value: number;
	onChange: (val: number) => void;
}) {
	const wholeVal = Math.max(30, Math.min(200, Math.floor(value)));
	const decimalVal = Math.max(
		0,
		Math.min(9, Math.round((value - Math.floor(value)) * 10) % 10),
	);

	const wholeScrollRef = useRef<HTMLDivElement>(null);
	const decimalScrollRef = useRef<HTMLDivElement>(null);
	const isScrollingWhole = useRef(false);
	const isScrollingDecimal = useRef(false);

	// Sync initial scroll on mount
	useEffect(() => {
		const wholeIdx = Math.max(0, WHOLE_KG.indexOf(wholeVal));
		const decimalIdx = Math.max(0, TENTHS.indexOf(decimalVal));

		if (wholeScrollRef.current) {
			wholeScrollRef.current.scrollTop = wholeIdx * ITEM_HEIGHT;
		}
		if (decimalScrollRef.current) {
			decimalScrollRef.current.scrollTop = decimalIdx * ITEM_HEIGHT;
		}
	}, []);

	// Sync scroll when value changes externally (e.g. quick steppers)
	useEffect(() => {
		if (wholeScrollRef.current && !isScrollingWhole.current) {
			const targetIdx = WHOLE_KG.indexOf(wholeVal);
			if (targetIdx !== -1) {
				const currentIdx = Math.round(
					wholeScrollRef.current.scrollTop / ITEM_HEIGHT,
				);
				if (currentIdx !== targetIdx) {
					wholeScrollRef.current.scrollTo({
						top: targetIdx * ITEM_HEIGHT,
						behavior: "smooth",
					});
				}
			}
		}
		if (decimalScrollRef.current && !isScrollingDecimal.current) {
			const targetIdx = TENTHS.indexOf(decimalVal);
			if (targetIdx !== -1) {
				const currentIdx = Math.round(
					decimalScrollRef.current.scrollTop / ITEM_HEIGHT,
				);
				if (currentIdx !== targetIdx) {
					decimalScrollRef.current.scrollTo({
						top: targetIdx * ITEM_HEIGHT,
						behavior: "smooth",
					});
				}
			}
		}
	}, [wholeVal, decimalVal]);

	const handleWholeScroll = (e: React.UIEvent<HTMLDivElement>) => {
		isScrollingWhole.current = true;
		const top = e.currentTarget.scrollTop;
		const idx = Math.round(top / ITEM_HEIGHT);
		const clampedIdx = Math.max(0, Math.min(WHOLE_KG.length - 1, idx));
		const newWhole = WHOLE_KG[clampedIdx];
		if (newWhole !== wholeVal) {
			onChange(Number((newWhole + decimalVal / 10).toFixed(1)));
		}
		clearTimeout((window as any).__wholeScrollTimeout);
		(window as any).__wholeScrollTimeout = setTimeout(() => {
			isScrollingWhole.current = false;
		}, 150);
	};

	const handleDecimalScroll = (e: React.UIEvent<HTMLDivElement>) => {
		isScrollingDecimal.current = true;
		const top = e.currentTarget.scrollTop;
		const idx = Math.round(top / ITEM_HEIGHT);
		const clampedIdx = Math.max(0, Math.min(TENTHS.length - 1, idx));
		const newDecimal = TENTHS[clampedIdx];
		if (newDecimal !== decimalVal) {
			onChange(Number((wholeVal + newDecimal / 10).toFixed(1)));
		}
		clearTimeout((window as any).__decimalScrollTimeout);
		(window as any).__decimalScrollTimeout = setTimeout(() => {
			isScrollingDecimal.current = false;
		}, 150);
	};

	const scrollToWhole = (targetWhole: number) => {
		const idx = WHOLE_KG.indexOf(targetWhole);
		if (idx !== -1 && wholeScrollRef.current) {
			wholeScrollRef.current.scrollTo({
				top: idx * ITEM_HEIGHT,
				behavior: "smooth",
			});
		}
	};

	const scrollToDecimal = (targetDecimal: number) => {
		const idx = TENTHS.indexOf(targetDecimal);
		if (idx !== -1 && decimalScrollRef.current) {
			decimalScrollRef.current.scrollTo({
				top: idx * ITEM_HEIGHT,
				behavior: "smooth",
			});
		}
	};

	return (
		<div className="relative w-full max-w-[280px] mx-auto h-[210px] flex items-center justify-center select-none overflow-hidden my-3">
			{/* Center Glass Highlight Selection Bar */}
			<div className="pointer-events-none absolute top-1/2 -translate-y-1/2 inset-x-2 h-[46px] rounded-2xl bg-foreground/[0.06] border border-foreground/[0.1] shadow-inner backdrop-blur-xs" />

			{/* Top 3D Cylindrical Fade Vignette */}
			<div className="pointer-events-none absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-background via-background/85 to-transparent z-10" />

			{/* Bottom 3D Cylindrical Fade Vignette */}
			<div className="pointer-events-none absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-background via-background/85 to-transparent z-10" />

			{/* Dual Drums Container */}
			<div className="flex items-center justify-center w-full z-0">
				{/* Whole KG Drum */}
				<div
					ref={wholeScrollRef}
					onScroll={handleWholeScroll}
					className="h-[210px] w-28 overflow-y-auto snap-y snap-mandatory scrollbar-none py-[83px] text-right pr-3">
					{WHOLE_KG.map((num) => {
						const diff = Math.abs(num - wholeVal);
						const isSelected = diff === 0;
						return (
							<button
								key={`whole-${num}`}
								type="button"
								onClick={() => scrollToWhole(num)}
								className={`h-[44px] w-full flex items-center justify-end snap-center transition-all duration-150 cursor-pointer ${
									isSelected
										? "text-4xl font-extrabold text-foreground scale-100"
										: diff === 1
											? "text-2xl font-semibold text-neutral-400 dark:text-neutral-500 scale-90"
											: "text-base font-medium text-neutral-300 dark:text-neutral-600 scale-75"
								}`}>
								{num}
							</button>
						);
					})}
				</div>

				{/* Decimal Point Separator */}
				<div className="h-[44px] flex items-center justify-center text-3xl font-black text-foreground/40 px-1">
					.
				</div>

				{/* Decimal Tenths Drum */}
				<div
					ref={decimalScrollRef}
					onScroll={handleDecimalScroll}
					className="h-[210px] w-16 overflow-y-auto snap-y snap-mandatory scrollbar-none py-[83px] text-left pl-1">
					{TENTHS.map((num) => {
						const diff = Math.abs(num - decimalVal);
						const isSelected = diff === 0;
						return (
							<button
								key={`tenth-${num}`}
								type="button"
								onClick={() => scrollToDecimal(num)}
								className={`h-[44px] w-full flex items-center justify-start snap-center transition-all duration-150 cursor-pointer ${
									isSelected
										? "text-4xl font-extrabold text-foreground scale-100"
										: diff === 1
											? "text-2xl font-semibold text-neutral-400 dark:text-neutral-500 scale-90"
											: "text-base font-medium text-neutral-300 dark:text-neutral-600 scale-75"
								}`}>
								{num}
							</button>
						);
					})}
				</div>

				{/* Unit Label */}
				<div className="h-[44px] flex items-center justify-start text-base font-bold text-foreground/40 pl-2 tracking-wide">
					kg
				</div>
			</div>
		</div>
	);
}

export interface LogWeightModalProps {
	isOpen: boolean;
	onClose: () => void;
	initialWeight?: number | null;
	initialDateStr?: string;
	days?: WeekDayWeight[];
	onSuccess?: (savedWeight: number, dateStr: string) => void;
}

export function LogWeightModal({
	isOpen,
	onClose,
	initialWeight,
	initialDateStr,
	days,
	onSuccess,
}: LogWeightModalProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
		return initialDateStr || format(new Date(), "yyyy-MM-dd");
	});

	const [weightVal, setWeightVal] = useState<number>(() => {
		if (initialWeight && initialWeight > 0) return initialWeight;
		return 70.0;
	});

	// Synchronize when initial props change
	useEffect(() => {
		if (initialDateStr) {
			setSelectedDateStr(initialDateStr);
		}
	}, [initialDateStr]);

	useEffect(() => {
		if (initialWeight && initialWeight > 0) {
			setWeightVal(initialWeight);
		}
	}, [initialWeight]);

	if (!isOpen) return null;

	const handleSave = () => {
		if (isNaN(weightVal) || weightVal <= 0 || weightVal > 350) return;

		startTransition(async () => {
			try {
				await saveBodyWeight(weightVal, selectedDateStr);
				onSuccess?.(weightVal, selectedDateStr);
				onClose();
				router.refresh();
			} catch (err) {
				console.error("Failed to save body weight:", err);
			}
		});
	};

	const adjust = (delta: number) => {
		const next = Math.max(
			20,
			Math.min(300, Number((weightVal + delta).toFixed(1))),
		);
		setWeightVal(next);
	};

	const isToday = selectedDateStr === format(new Date(), "yyyy-MM-dd");

	return (
		<div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-2xl flex flex-col justify-between p-6 sm:p-8 animate-in fade-in duration-200 overflow-y-auto">
			{/* ── Top Bar ── */}
			<div className="flex items-center justify-between max-w-lg mx-auto w-full pt-2">
				<button
					type="button"
					onClick={onClose}
					className="text-base font-medium text-foreground/40 hover:text-foreground transition-colors cursor-pointer py-1">
					Cancel
				</button>

				<div className="flex items-center gap-1.5 text-foreground/40 font-semibold text-xs uppercase tracking-widest">
					<Scale className="w-3.5 h-3.5 text-brand-primary" />
					<span>Log Weight</span>
				</div>

				<button
					type="button"
					onClick={handleSave}
					disabled={isPending || weightVal <= 0}
					className="px-4 py-1.5 rounded-xl bg-brand-primary text-white text-sm font-semibold shadow-md shadow-brand-primary/25 hover:opacity-95 active:scale-95 disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer">
					{isPending ? (
						<>
							<Loader2 className="w-3.5 h-3.5 animate-spin" />
							<span>Saving</span>
						</>
					) : (
						<>
							<Check className="w-3.5 h-3.5" />
							<span>Save</span>
						</>
					)}
				</button>
			</div>

			{/* ── Center Content: Apple Alarm Wheel Picker ── */}
			<div className="flex flex-col items-center justify-center max-w-md mx-auto w-full py-8 space-y-6">
				{/* Date Header */}
				<div className="text-center space-y-1">
					<h3 className="text-lg md:text-xl font-bold text-foreground">
						{isToday
							? "Today's Weight"
							: format(parseISO(selectedDateStr), "EEEE, d MMMM")}
					</h3>
					<p className="text-xs text-foreground/30 font-medium">
						Scroll the wheel to set your body weight
					</p>
				</div>

				{/* Optional Weekday Pills if available */}
				{days && days.length > 0 && (
					<div className="flex items-center gap-1 p-1 bg-foreground/[0.03] rounded-2xl border border-foreground/[0.06] overflow-x-auto scrollbar-none max-w-xs w-full">
						{days.map((day) => {
							const isSelected = day.dateStr === selectedDateStr;
							return (
								<button
									key={day.dateStr}
									type="button"
									onClick={() => {
										setSelectedDateStr(day.dateStr);
										if (day.weight !== null) {
											setWeightVal(day.weight);
										}
									}}
									className={`flex-1 min-w-[36px] py-1 px-1 rounded-xl text-center text-xs transition-all cursor-pointer ${
										isSelected
											? "bg-brand-primary text-white font-semibold shadow-xs"
											: "text-foreground/40 hover:text-foreground"
									}`}>
									<span className="text-[10px] block">{day.dayName}</span>
								</button>
							);
						})}
					</div>
				)}
				{/* ── Apple-Style Drum Tumbler Wheel ── */}
				<AppleWeightWheelPicker
					value={weightVal}
					onChange={(newVal) => setWeightVal(newVal)}
				/>

				{/* Quick Increment/Decrement Nudge Chips */}
				<div className="flex items-center gap-2 pt-1">
					<button
						type="button"
						onClick={() => adjust(-0.5)}
						className="px-3 py-1.5 rounded-xl bg-foreground/[0.04] hover:bg-foreground/[0.08] text-xs font-semibold text-foreground/60 active:scale-95 transition-all cursor-pointer">
						-0.5 kg
					</button>
					<button
						type="button"
						onClick={() => adjust(-0.1)}
						className="px-3 py-1.5 rounded-xl bg-foreground/[0.04] hover:bg-foreground/[0.08] text-xs font-semibold text-foreground/60 active:scale-95 transition-all cursor-pointer">
						-0.1 kg
					</button>
					<button
						type="button"
						onClick={() => adjust(+0.1)}
						className="px-3 py-1.5 rounded-xl bg-foreground/[0.04] hover:bg-foreground/[0.08] text-xs font-semibold text-foreground/60 active:scale-95 transition-all cursor-pointer">
						+0.1 kg
					</button>
					<button
						type="button"
						onClick={() => adjust(+0.5)}
						className="px-3 py-1.5 rounded-xl bg-foreground/[0.04] hover:bg-foreground/[0.08] text-xs font-semibold text-foreground/60 active:scale-95 transition-all cursor-pointer">
						+0.5 kg
					</button>
				</div>
			</div>

			{/* ── Bottom Footer / Primary Action ── */}
			<div className="max-w-md mx-auto w-full pb-4 space-y-3">
				<button
					type="button"
					onClick={handleSave}
					disabled={isPending || weightVal <= 0}
					className="w-full py-3.5 px-6 rounded-2xl bg-brand-primary text-white text-base font-semibold shadow-lg shadow-brand-primary/25 hover:opacity-95 active:scale-[0.99] disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer">
					{isPending ? (
						<>
							<Loader2 className="w-5 h-5 animate-spin" />
							<span>Saving Body Weight...</span>
						</>
					) : (
						<>
							<Check className="w-5 h-5" />
							<span>Save {weightVal.toFixed(1)} kg</span>
						</>
					)}
				</button>
				<p className="text-center text-[11px] text-foreground/25 font-normal">
					Consistent morning weigh-ins provide the most accurate trend
				</p>
			</div>
		</div>
	);
}
