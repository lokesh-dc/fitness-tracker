interface AdherenceRingProps {
	percent: number;
	completed: number;
	scheduled: number;
}

const SIZE = 168;
const STROKE = 14;
const R = (SIZE - STROKE) / 2 - 4;
const CIRCUMFERENCE = 2 * Math.PI * R;

export function AdherenceRing({ percent, completed, scheduled }: AdherenceRingProps) {
	const clamped = Math.max(0, Math.min(100, percent));
	const dash = (clamped / 100) * CIRCUMFERENCE;

	return (
		<div
			className="relative shrink-0"
			style={{ width: SIZE, height: SIZE }}>
			<svg width={SIZE} height={SIZE} className="-rotate-90">
				<circle
					cx={SIZE / 2}
					cy={SIZE / 2}
					r={R}
					fill="none"
					stroke="var(--foreground)"
					strokeOpacity={0.07}
					strokeWidth={STROKE}
				/>
				<circle
					cx={SIZE / 2}
					cy={SIZE / 2}
					r={R}
					fill="none"
					stroke="var(--brand-accent)"
					strokeWidth={STROKE}
					strokeLinecap="round"
					strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
					style={{ transition: "stroke-dasharray 1s cubic-bezier(0.16, 1, 0.3, 1)" }}
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<p className="text-4xl font-black text-foreground tabular-nums leading-none">
					{clamped}
					<span className="text-lg font-black text-foreground/40">%</span>
				</p>
				<p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest mt-1.5">
					Adherence
				</p>
			</div>
			<span className="sr-only">
				{completed} of {scheduled} planned sessions completed
			</span>
		</div>
	);
}
