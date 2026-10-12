import { HeartPulse } from "lucide-react";
import {
	figureShapes,
	groupAnatomy,
	highlightShapes,
	muscleKey,
	ShapeLayer,
} from "@/components/ui/muscle-anatomy";

export { muscleKey };

/**
 * Body-map icon for a muscle group: a figure of the body with the relevant
 * region lit up. Takes its colour from `className` (fill="currentColor").
 */
export default function MuscleIcon({
	muscle,
	className,
}: {
	muscle: string;
	className?: string;
}) {
	// Cardio isn't a muscle group, so it gets the organ instead.
	if (muscle.toLowerCase().includes("cardio")) {
		return <HeartPulse className={className} />;
	}

	const anatomy = groupAnatomy(muscle);
	const highlight = anatomy ? highlightShapes(anatomy.region, anatomy.pose) : [];

	return (
		<svg
			viewBox="0 0 24 24"
			fill="currentColor"
			className={className}
			aria-hidden="true">
			<ShapeLayer shapes={figureShapes(anatomy?.pose ?? "hang")} opacity={0.5} />
			<ShapeLayer shapes={highlight} />
		</svg>
	);
}
