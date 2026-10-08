import type { SVGProps } from "react";

export type Shape =
	| { kind: "circle"; cx: number; cy: number; r: number }
	| {
			kind: "rect";
			x: number;
			y: number;
			w: number;
			h: number;
			rx: number;
			transform?: string;
	  };

/* Stylised human figure in a 24x24 box. Everything is described as plain shape
   data so the same geometry can be drawn as a static icon and as an
   interactive, tappable body map. */

const HEAD: Shape = { kind: "circle", cx: 12, cy: 3.1, r: 1.85 };
const TORSO: Shape = { kind: "rect", x: 8.7, y: 5.5, w: 6.6, h: 7.3, rx: 2 };
const LEG_L: Shape = { kind: "rect", x: 9, y: 13.2, w: 2.7, h: 9.5, rx: 1.35 };
const LEG_R: Shape = { kind: "rect", x: 12.3, y: 13.2, w: 2.7, h: 9.5, rx: 1.35 };

/* Shoulder pivot is the top-centre of the upper arm; swinging out 22deg puts
   the elbow at (5.64, 10.19) on the left and (18.36, 10.19) on the right.
   The arms are 2.1 wide so the pivots stay at 7.25 / 16.75. */
const UPPER_ARM_L: Shape = { kind: "rect", x: 6.2, y: 6.2, w: 2.1, h: 4.3, rx: 1.05 };
const UPPER_ARM_R: Shape = { kind: "rect", x: 15.7, y: 6.2, w: 2.1, h: 4.3, rx: 1.05 };
const UPPER_ARM_OUT_L: Shape = {
	kind: "rect",
	x: 6.2,
	y: 6.2,
	w: 2.1,
	h: 4.3,
	rx: 1.05,
	transform: "rotate(22 7.25 6.2)",
};
const UPPER_ARM_OUT_R: Shape = {
	kind: "rect",
	x: 15.7,
	y: 6.2,
	w: 2.1,
	h: 4.3,
	rx: 1.05,
	transform: "rotate(-22 16.75 6.2)",
};

const FOREARM_L: Shape = { kind: "rect", x: 6.2, y: 11, w: 2.1, h: 4.7, rx: 1.05 };
const FOREARM_R: Shape = { kind: "rect", x: 15.7, y: 11, w: 2.1, h: 4.7, rx: 1.05 };
/* Curl: forearm swings straight up from the elbow. */
const FOREARM_CURL_L: Shape = { kind: "rect", x: 4.59, y: 5.49, w: 2.1, h: 4.7, rx: 1.05 };
const FOREARM_CURL_R: Shape = { kind: "rect", x: 17.51, y: 5.49, w: 2.1, h: 4.7, rx: 1.05 };
/* Lockout: forearm continues along the same 22deg line. */
const FOREARM_OUT_L: Shape = {
	kind: "rect",
	x: 6.2,
	y: 11,
	w: 2.1,
	h: 4.7,
	rx: 1.05,
	transform: "translate(-1.611 -0.813) rotate(22 7.25 11)",
};
const FOREARM_OUT_R: Shape = {
	kind: "rect",
	x: 15.7,
	y: 11,
	w: 2.1,
	h: 4.7,
	rx: 1.05,
	transform: "translate(1.611 -0.813) rotate(-22 16.75 11)",
};

/** Arm position: resting at the sides, curled up, or locked out. */
export type Pose = "hang" | "curl" | "spread";

export const POSE_SHAPES: Record<Pose, { arms: Shape[]; upperArms: Shape[] }> = {
	hang: {
		arms: [UPPER_ARM_L, UPPER_ARM_R, FOREARM_L, FOREARM_R],
		upperArms: [UPPER_ARM_L, UPPER_ARM_R],
	},
	curl: {
		arms: [UPPER_ARM_OUT_L, UPPER_ARM_OUT_R, FOREARM_CURL_L, FOREARM_CURL_R],
		upperArms: [UPPER_ARM_OUT_L, UPPER_ARM_OUT_R],
	},
	spread: {
		arms: [UPPER_ARM_OUT_L, UPPER_ARM_OUT_R, FOREARM_OUT_L, FOREARM_OUT_R],
		upperArms: [UPPER_ARM_OUT_L, UPPER_ARM_OUT_R],
	},
};

export function figureShapes(pose: Pose): Shape[] {
	return [HEAD, TORSO, ...POSE_SHAPES[pose].arms, LEG_L, LEG_R];
}

/* The tappable / highlightable regions. */
export const REGION_SHAPES: Record<string, Shape[]> = {
	// Two pectorals, high and wide across the chest
	pecs: [
		{ kind: "rect", x: 9.2, y: 6.4, w: 2.6, h: 2.7, rx: 1.1 },
		{ kind: "rect", x: 12.2, y: 6.4, w: 2.6, h: 2.7, rx: 1.1 },
	],
	// Lats: taller panels sweeping down the back
	lats: [
		{ kind: "rect", x: 8.9, y: 6.3, w: 2.9, h: 4.4, rx: 1.2 },
		{ kind: "rect", x: 12.2, y: 6.3, w: 2.9, h: 4.4, rx: 1.2 },
	],
	// Deltoid caps on the outer corners of the shoulder line, kept clear of the
	// upper arm below so each region owns its own centre for tapping.
	delts: [
		{ kind: "circle", cx: 9, cy: 6.2, r: 1.3 },
		{ kind: "circle", cx: 15, cy: 6.2, r: 1.3 },
	],
	abs: [{ kind: "rect", x: 9.6, y: 9.4, w: 4.8, h: 3.2, rx: 1.2 }],
	legs: [LEG_L, LEG_R],
};

/* Which muscle group lights up which region, and from which side. Biceps and
   triceps both own the upper arm, so they are split across the two views. A
   group with no view (cardio, legacy whole-arm) can only be picked as a chip. */
const GROUP_ANATOMY: Record<string, { region: string; view?: BodyView; pose: Pose }> = {
	chest: { region: "pecs", view: "front", pose: "hang" },
	shoulders: { region: "delts", view: "front", pose: "hang" },
	biceps: { region: "upperArms", view: "front", pose: "curl" },
	forearms: { region: "forearms", view: "front", pose: "hang" },
	core: { region: "abs", view: "front", pose: "hang" },
	abs: { region: "abs", view: "front", pose: "hang" },
	legs: { region: "legs", view: "front", pose: "hang" },
	lowerbody: { region: "legs", view: "front", pose: "hang" },
	glutes: { region: "legs", view: "front", pose: "hang" },
	quads: { region: "legs", view: "front", pose: "hang" },
	hamstrings: { region: "legs", view: "front", pose: "hang" },
	calves: { region: "legs", view: "front", pose: "hang" },
	back: { region: "lats", view: "back", pose: "spread" },
	triceps: { region: "upperArms", view: "back", pose: "spread" },
	arms: { region: "arms", pose: "hang" },
};

export type BodyView = "front" | "back";

/** Front is a neutral stand, back is a lat spread, so the views look different. */
export const VIEW_POSE: Record<BodyView, Pose> = {
	front: "hang",
	back: "spread",
};

export function highlightShapes(region: string, pose: Pose): Shape[] {
	switch (region) {
		case "upperArms":
			return POSE_SHAPES[pose].upperArms;
		case "forearms":
			return POSE_SHAPES[pose].arms.filter(
				(s) => s.kind === "rect" && s.y >= 11,
			);
		case "arms":
			return POSE_SHAPES[pose].arms;
		default:
			return REGION_SHAPES[region] ?? [];
	}
}

export function muscleKey(muscle: string) {
	return muscle.toLowerCase().replace(/\s+muscles?$/, "").trim();
}

/** null when the group has no place on the body (cardio, legacy groups, ...). */
export function groupAnatomy(muscle: string) {
	return GROUP_ANATOMY[muscleKey(muscle)] ?? null;
}

export const VIEWS: BodyView[] = ["front", "back"];

/* Tight framing per view so both render the body at the same scale. */
export const VIEW_BOX: Record<BodyView, string> = {
	front: "5.9 0.9 12.2 22.2",
	back: "4.2 0.9 15.6 22.2",
};

export function viewBoxSize(view: BodyView) {
	const [, , w, h] = VIEW_BOX[view].split(" ").map(Number);
	return { w, h };
}

export function ShapeLayer({
	shapes,
	...props
}: { shapes: Shape[] } & SVGProps<SVGGElement>) {
	return (
		<g {...props}>
			{shapes.map((s, i) =>
				s.kind === "circle" ? (
					<circle key={i} cx={s.cx} cy={s.cy} r={s.r} />
				) : (
					<rect
						key={i}
						x={s.x}
						y={s.y}
						width={s.w}
						height={s.h}
						rx={s.rx}
						transform={s.transform}
					/>
				),
			)}
		</g>
	);
}
