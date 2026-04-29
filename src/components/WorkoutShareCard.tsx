"use client";

import { forwardRef } from "react";
import { format } from "date-fns";

export interface ExerciseDetail {
	name: string;
	sets: { weight: number; reps: number }[];
	isPR?: boolean;
}

interface WorkoutShareCardProps {
	stats: {
		exercises: number;
		totalSets: number;
		totalReps: number;
	};
	exerciseDetails: ExerciseDetail[];
	splitName?: string;
}

export const WorkoutShareCard = forwardRef<HTMLDivElement, WorkoutShareCardProps>(
	function WorkoutShareCard({ stats, exerciseDetails, splitName }, ref) {
		const today = format(new Date(), "d MMMM yyyy");

		return (
			<div
				ref={ref}
				style={{
					position: "fixed",
					left: "-9999px",
					top: 0,
					width: "1080px",
					height: "1920px",
					fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
					background: "linear-gradient(165deg, #064e3b 0%, #022c22 35%, #0a0a0a 70%, #111827 100%)",
					color: "#ffffff",
					display: "flex",
					flexDirection: "column",
					overflow: "hidden",
				}}>
				{/* Decorative circles */}
				<div
					style={{
						position: "absolute",
						top: "-120px",
						right: "-120px",
						width: "500px",
						height: "500px",
						borderRadius: "50%",
						background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)",
					}}
				/>
				<div
					style={{
						position: "absolute",
						bottom: "-200px",
						left: "-100px",
						width: "600px",
						height: "600px",
						borderRadius: "50%",
						background: "radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)",
					}}
				/>

				{/* Top branding */}
				<div
					style={{
						padding: "80px 80px 40px",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}>
					<div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
						<div
							style={{
								width: "56px",
								height: "56px",
								borderRadius: "16px",
								background: "linear-gradient(135deg, #10b981, #059669)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: "28px",
							}}>
							💪
						</div>
						<div>
							<div
								style={{
									fontSize: "28px",
									fontWeight: 900,
									letterSpacing: "0.15em",
									textTransform: "uppercase" as const,
									color: "rgba(255,255,255,0.9)",
								}}>
								Fitness Tracker
							</div>
						</div>
					</div>
					<div
						style={{
							fontSize: "24px",
							fontWeight: 700,
							color: "rgba(255,255,255,0.4)",
							letterSpacing: "0.05em",
						}}>
						{today}
					</div>
				</div>

				{/* Main title section */}
				<div
					style={{
						padding: "40px 80px 60px",
						textAlign: "center" as const,
					}}>
					<div style={{ fontSize: "64px", marginBottom: "16px" }}>🏆</div>
					<h1
						style={{
							fontSize: "72px",
							fontWeight: 900,
							letterSpacing: "0.05em",
							textTransform: "uppercase" as const,
							margin: "0 0 12px",
							// background: "linear-gradient(135deg, #ffffff 0%, #a7f3d0 100%)",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							backgroundClip: "text",
						}}>
						Workout Complete
					</h1>
					{splitName && (
						<div
							style={{
								fontSize: "30px",
								fontWeight: 800,
								color: "#10b981",
								letterSpacing: "0.2em",
								textTransform: "uppercase" as const,
							}}>
							{splitName}
						</div>
					)}
				</div>

				{/* Stats row */}
				<div
					style={{
						margin: "0 80px",
						padding: "48px 0",
						display: "flex",
						justifyContent: "space-around",
						borderTop: "1px solid rgba(255,255,255,0.08)",
						borderBottom: "1px solid rgba(255,255,255,0.08)",
					}}>
					{[
						{ label: "Exercises", value: stats.exercises, icon: "🏋️" },
						{ label: "Sets", value: stats.totalSets, icon: "🔄" },
						{ label: "Reps", value: stats.totalReps, icon: "✅" },
					].map((stat) => (
						<div
							className="flex flex-col gap-2"
							key={stat.label}
							style={{
								textAlign: "center" as const,
								flex: 1,
							}}>
							<div style={{ fontSize: "40px", marginBottom: "12px" }}>
								{stat.icon}
							</div>
							<div
								style={{
									fontSize: "56px",
									fontWeight: 900,
									color: "#ffffff",
									lineHeight: 1,
									marginBottom: "8px",
								}}>
								{stat.value}
							</div>
							<div
								style={{
									fontSize: "20px",
									fontWeight: 800,
									color: "rgba(255,255,255,0.35)",
									letterSpacing: "0.25em",
									textTransform: "uppercase" as const,
								}}>
								{stat.label}
							</div>
						</div>
					))}
				</div>

				{/* Exercise breakdown */}
				<div
					style={{
						flex: 1,
						padding: "48px 80px",
						overflow: "hidden",
					}}>
					<div
						style={{
							fontSize: "20px",
							fontWeight: 800,
							color: "rgba(255,255,255,0.3)",
							letterSpacing: "0.25em",
							textTransform: "uppercase" as const,
							marginBottom: "28px",
						}}>
						Exercise Breakdown
					</div>
					<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
						{exerciseDetails.slice(0, 8).map((ex, idx) => {
							const maxWeight = Math.max(...ex.sets.map((s) => s.weight));
							return (
								<div
									key={idx}
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										padding: "20px 28px",
										background: ex.isPR ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)",
										borderRadius: "20px",
										border: ex.isPR ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.06)",
									}}>
									<div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
										<div
											style={{
												width: "44px",
												height: "44px",
												borderRadius: "12px",
												background: ex.isPR ? "#10b981" : "rgba(16,185,129,0.15)",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												fontSize: "22px",
												fontWeight: 900,
												color: ex.isPR ? "#000000" : "#10b981",
											}}>
											{idx + 1}
										</div>
										<div
											style={{
												fontSize: "28px",
												fontWeight: 800,
												color: "rgba(255,255,255,0.85)",
											}}>
											{ex.name}
											{ex.isPR && <span style={{ marginLeft: "12px" }}>🏆</span>}
										</div>
									</div>
									<div
										style={{
											display: "flex",
											alignItems: "center",
											gap: "24px",
										}}>
										<div style={{ textAlign: "right" as const }}>
											<div
												style={{
													fontSize: "28px",
													fontWeight: 900,
													color: ex.isPR ? "#ffffff" : "#10b981",
												}}>
												{ex.sets.length} × {maxWeight > 0 ? `${maxWeight} kg` : `${ex.sets[0]?.reps || 0} reps`}
											</div>
										</div>
									</div>
								</div>
							);
						})}
						{exerciseDetails.length > 8 && (
							<div
								style={{
									textAlign: "center" as const,
									fontSize: "22px",
									fontWeight: 700,
									color: "rgba(255,255,255,0.3)",
									paddingTop: "8px",
								}}>
								+{exerciseDetails.length - 8} more exercises
							</div>
						)}
					</div>
				</div>

				{/* Footer */}
				<div
					style={{
						padding: "40px 80px 60px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: "12px",
					}}>
					<div
						style={{
							height: "1px",
							flex: 1,
							background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
						}}
					/>
					<div
						style={{
							fontSize: "20px",
							fontWeight: 700,
							color: "rgba(255,255,255,0.25)",
							letterSpacing: "0.3em",
							textTransform: "uppercase" as const,
							whiteSpace: "nowrap" as const,
						}}>
						Tracked with Fitness Tracker
					</div>
					<div
						style={{
							height: "1px",
							flex: 1,
							background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
						}}
					/>
				</div>
			</div>
		);
	},
);
