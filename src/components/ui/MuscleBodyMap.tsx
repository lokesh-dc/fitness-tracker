"use client";

import { useState } from "react";
import MuscleIcon from "@/components/ui/MuscleIcon";
import {
	groupAnatomy,
	figureShapes,
	highlightShapes,
	ShapeLayer,
	VIEW_BOX,
	VIEW_POSE,
	viewBoxSize,
	VIEWS,
	type BodyView,
} from "@/components/ui/muscle-anatomy";
import { cn } from "@/lib/utils";

export interface BodyGroup {
	muscle: string;
	count: number;
}

/**
 * One body, seen from the front or the back, with every muscle group that
 * belongs there drawn as a tappable region. Groups that aren't a muscle (or
 * that would collide with another) fall back to chips underneath.
 */
export default function MuscleBodyMap({
	groups,
	selected,
	onToggle,
}: {
	groups: BodyGroup[];
	selected: string[];
	onToggle: (muscle: string) => void;
}) {
	const [view, setView] = useState<BodyView>("front");
	const [hovered, setHovered] = useState<string | null>(null);

	const onBody = groups.filter(
		(g) => groupAnatomy(g.muscle)?.view === view,
	);
	// Anything that can't claim a region of its own — cardio, the legacy
	// whole-arm group, custom groups — becomes a chip.
	const extra = groups.filter(
		(g) => !groupAnatomy(g.muscle)?.view && !selected.includes(g.muscle),
	);

	const focus = hovered ? groups.find((g) => g.muscle === hovered) : undefined;
	const { w, h } = viewBoxSize(view);
	const pose = VIEW_POSE[view];

	return (
		<div className="flex flex-col items-center">
			{/* Front / back switch */}
			<div className="flex items-center gap-1 p-1 rounded-full bg-foreground/5 border border-foreground/10">
				{VIEWS.map((v) => (
					<button
						key={v}
						onClick={() => {
							setView(v);
							setHovered(null);
						}}
						aria-pressed={view === v}
						className={cn(
							"px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
							view === v
								? "bg-brand-primary text-black"
								: "text-foreground/40 hover:text-foreground/80",
						)}>
						{v}
					</button>
				))}
			</div>

			<svg
				viewBox={VIEW_BOX[view]}
				style={{ height: 260, aspectRatio: `${w} / ${h}` }}
				className="mt-1">
				<ShapeLayer shapes={figureShapes(pose)} className="fill-foreground/20" />

				{onBody.map(({ muscle, count }) => {
					const anatomy = groupAnatomy(muscle);
					if (!anatomy) return null;
					const shapes = highlightShapes(anatomy.region, pose);
					const isSelected = selected.includes(muscle);
					const isHot = hovered === muscle;

					return (
						<g
							key={muscle}
							role="button"
							tabIndex={0}
							aria-pressed={isSelected}
							aria-label={`${muscle}, ${count} ${count === 1 ? "move" : "moves"}`}
							className="cursor-pointer outline-none"
							onClick={() => {
								// Keep the caption on the last region touched, since
								// touch devices never fire the hover events above.
								setHovered(muscle);
								onToggle(muscle);
							}}
							onPointerEnter={() => setHovered(muscle)}
							onPointerLeave={() => setHovered(null)}
							onFocus={() => setHovered(muscle)}
							onBlur={() => setHovered(null)}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									onToggle(muscle);
								}
							}}>
							{/* No extra hit padding: the deltoids genuinely overlap the upper
							    arms, so padding one would swallow the other. */}
							<ShapeLayer
								shapes={shapes}
								className={cn(
									isSelected
										? "fill-brand-primary"
										: isHot
											? "fill-foreground/40"
											: "fill-foreground/15",
								)}
								stroke={
									isSelected
										? "stroke-brand-primary"
										: isHot
											? "stroke-foreground/60"
											: "stroke-foreground/30"
								}
								strokeWidth={isSelected ? 0.35 : 0.28}
								strokeDasharray={isSelected ? undefined : "0.7 0.5"}
							/>
						</g>
					);
				})}
			</svg>

			{/* Names the region under the finger */}
			<p
				aria-live="polite"
				className="h-4 text-[10px] font-black uppercase tracking-[0.2em] text-center">
				{focus ? (
					<span className="text-foreground/70">
						{focus.muscle}
						<span className="text-foreground/30">
							{" "}
							· {focus.count} {focus.count === 1 ? "move" : "moves"}
						</span>
					</span>
				) : (
					<span className="text-foreground/25">Tap a muscle to train it</span>
				)}
			</p>

			{/* Groups that have no region of their own */}
			{extra.length > 0 && (
				<div className="flex flex-wrap items-center justify-center gap-2 pt-2">
					{extra.map(({ muscle, count }) => (
						<button
							key={muscle}
							onClick={() => onToggle(muscle)}
							className="flex items-center gap-1.5 rounded-full border border-dashed border-foreground/25 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-foreground/50 transition-colors hover:border-brand-primary hover:text-brand-primary">
							<MuscleIcon muscle={muscle} className="w-3.5 h-3.5" />
							{muscle}
							<span className="opacity-50">{count}</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
