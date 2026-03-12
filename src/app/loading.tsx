import { Loader2 } from "lucide-react";

export default function Loading() {
	return (
		<div className="fixed inset-0 flex flex-col items-center justify-center z-[100] bg-background/10 backdrop-blur-sm animate-in fade-in duration-500">
			<div className="relative">
				<div className="w-20 h-20 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center animate-pulse shadow-[0_0_40px_rgba(249,115,22,0.1)]">
					<Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
				</div>
			</div>

			<div className="mt-8 text-center space-y-2">
				<h2 className="text-sm font-black text-foreground uppercase tracking-[0.3em]">
					Loading
				</h2>
				<p className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em]">
					Preparing your performance
				</p>
			</div>
		</div>
	);
}
