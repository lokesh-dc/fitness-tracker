import { cn } from "@/lib/utils";

interface MiniSparklineProps {
	data: { date: string; bodyWeight: number }[];
	className?: string;
}

const VB_W = 100;
const VB_H = 30;
const PAD = 2;

export function MiniSparkline({ data, className }: MiniSparklineProps) {
	if (!data || data.length < 2) return null;

	const weights = data.map((d) => d.bodyWeight);
	const min = Math.min(...weights);
	const max = Math.max(...weights);
	const range = max - min || 1;

	const points = data.map((d, i) => {
		const x =
			PAD + (i / (data.length - 1)) * (VB_W - PAD * 2);
		const y =
			VB_H - PAD - ((d.bodyWeight - min) / range) * (VB_H - PAD * 2);
		return [Number(x.toFixed(2)), Number(y.toFixed(2))] as const;
	});

	const linePoints = points.map(([x, y]) => `${x},${y}`).join(" ");
	const areaPoints = `${linePoints} ${VB_W - PAD},${VB_H} ${PAD},${VB_H}`;

	return (
		<svg
			viewBox={`0 0 ${VB_W} ${VB_H}`}
			preserveAspectRatio="none"
			className={cn("w-full h-9", className)}
			role="img"
			aria-label="Body weight trend during plan">
			<defs>
				<linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="var(--brand-accent)" stopOpacity={0.25} />
					<stop offset="100%" stopColor="var(--brand-accent)" stopOpacity={0} />
				</linearGradient>
			</defs>
			<polygon points={areaPoints} fill="url(#sparkFill)" />
			<polyline
				points={linePoints}
				fill="none"
				stroke="var(--brand-accent)"
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
				vectorEffect="non-scaling-stroke"
			/>
			<circle
				cx={points[points.length - 1][0]}
				cy={points[points.length - 1][1]}
				r={2.5}
				fill="var(--brand-accent)"
				vectorEffect="non-scaling-stroke"
			/>
		</svg>
	);
}
