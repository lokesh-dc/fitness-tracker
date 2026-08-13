"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { deleteWorkoutLog } from "@/app/actions/logs";

export function DeleteWorkoutButton({ logId }: { logId: string }) {
	const router = useRouter();
	const [showConfirm, setShowConfirm] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			const res = await deleteWorkoutLog(logId);
			if (res.success) {
				setShowConfirm(false);
				router.refresh();
			} else {
				alert("Failed to delete workout.");
			}
		} catch (err) {
			console.error(err);
			alert("Failed to delete workout.");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<>
			<button
				onClick={() => setShowConfirm(true)}
				className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-foreground/5 hover:bg-red-500/10 hover:text-red-500 transition-all text-[10px] font-black uppercase tracking-widest text-foreground/40">
				<Trash2 className="w-3 h-3" />
				<span>Delete</span>
			</button>

			{showConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
					<GlassCard className="max-w-md w-full p-6 space-y-6 animate-in zoom-in-95 duration-200 border-red-500/30">
						<div className="flex justify-center">
							<div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
								<AlertTriangle className="w-8 h-8 text-red-500" />
							</div>
						</div>
						<div className="text-center space-y-2">
							<h3 className="text-xl font-black uppercase tracking-tight text-foreground">
								Delete Workout?
							</h3>
							<p className="text-xs font-bold text-foreground/60 leading-relaxed">
								This action cannot be undone. The session and its sets will be
								permanently removed.
							</p>
						</div>
						<div className="flex space-x-4 pt-4">
							<button
								onClick={() => setShowConfirm(false)}
								className="flex-1 glass-button py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em]">
								Cancel
							</button>
							<button
								onClick={handleDelete}
								disabled={isDeleting}
								className="flex-1 bg-red-500 text-white py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center">
								{isDeleting ? (
									<Loader2 className="w-4 h-4 animate-spin" />
								) : (
									"Confirm Delete"
								)}
							</button>
						</div>
					</GlassCard>
				</div>
			)}
		</>
	);
}
