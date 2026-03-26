import Link from "next/link";
import {
	Dumbbell,
	Calendar,
	Activity,
	CheckCircle2,
	BarChart3,
	Dumbbell as DumbbellIcon,
	Trophy,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
	const session = await getServerSession(authOptions);

	if (session) {
		redirect("/dashboard");
	}

	return (
		<div className="flex flex-col min-h-screen bg-[#050505] text-white">
			{/* Hero Section */}
			<section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
				<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-brand-primary/10 blur-[120px] rounded-full -z-10" />

				<div className="max-w-6xl mx-auto px-6 text-center space-y-8">
					<div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-1000">
						<Trophy className="w-4 h-4" />
						<span>The Future of Strength Tracking</span>
					</div>

					<h1 className="text-5xl md:text-8xl font-black tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
						Build Your <span className="text-brand-primary">Peak</span>{" "}
						<br className="hidden md:block" /> Performance.
					</h1>

					<p className="max-w-2xl mx-auto text-foreground/60 text-lg md:text-xl font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
						An elite, data-driven workout tracker designed for serious athletes.
						Manage cycles, track PRs, and visualize your progress with surgical
						precision.
					</p>

					<div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
						<Link
							href="/auth/signup"
							className="w-full md:w-auto px-10 py-5 bg-brand-primary text-black rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(249,115,22,0.4)]">
							Start Your Journey
						</Link>
						<Link
							href="/auth/signin"
							className="w-full md:w-auto px-10 py-5 glass-button border-foreground/10 text-foreground rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-foreground/5 transition-all">
							Log In
						</Link>
					</div>
				</div>
			</section>

			{/* Feature Sections */}
			<section className="py-24 space-y-32">
				{/* Analytics */}
				<FeatureSection
					title="Surgical Analytics"
					subtitle="Visualize Every Variable"
					description="Gain deep insights into your training with advanced charts. Track weight trends, exercise progress, and volume distribution with intuitive data visualization."
					image="file:///Users/lokesh_choudhary/.gemini/antigravity/brain/6867d406-bff9-41ee-bf84-83f679449511/analytics_view_1773651725358.png"
					features={[
						"Dynamic Trend Lines",
						"PR History Tracking",
						"Volume Breakdown",
						"Weight Management",
					]}
				/>

				{/* Planning */}
				<FeatureSection
					title="Intelligent Cycles"
					subtitle="Precision Programming"
					description="Design multi-week training cycles with ease. Copy weeks, adjust intensity, and set specific targets for every muscle group in our visual plan designer."
					image="file:///Users/lokesh_choudhary/.gemini/antigravity/brain/6867d406-bff9-41ee-bf84-83f679449511/plan_view_1773651742821.png"
					features={[
						"Automated Cycle Creation",
						"Template Library",
						"Progressive Overload Planning",
						"Master Week Templating",
					]}
					reverse
				/>

				{/* Logging */}
				<FeatureSection
					title="Frictionless Logging"
					subtitle="Focus on the Lift"
					description="A distraction-free logging interface designed for the gym floor. Quickly record sets, weight, and reps while keeping an eye on your best performance."
					image="file:///Users/lokesh_choudhary/.gemini/antigravity/brain/6867d406-bff9-41ee-bf84-83f679449511/dashboard_view_1773651707613.png"
					features={[
						"Set-Level Detail",
						"Personal Best Alerts",
						"Real-time Volume Calculation",
						"Historical Reference",
					]}
				/>
			</section>

			{/* Stats Section */}
			<section className="py-24 bg-foreground/[0.02]">
				<div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
					<StatBox icon={<BarChart3 />} label="Data Driven" value="100%" />
					<StatBox icon={<Activity />} label="Precision" value="High" />
					<StatBox icon={<DumbbellIcon />} label="Customizable" value="Total" />
					<StatBox icon={<Calendar />} label="Cycle Based" value="Focus" />
				</div>
			</section>

			{/* Footer / CTA */}
			<section className="py-32 px-6">
				<GlassCard className="max-w-4xl mx-auto p-12 text-center space-y-8 bg-gradient-to-br from-brand-primary/10 to-transparent border-brand-primary/20">
					<Dumbbell className="w-16 h-16 text-brand-primary mx-auto" />
					<h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
						Ready to transcend?
					</h2>
					<p className="text-foreground/60 max-w-lg mx-auto text-lg">
						Stop guessing and start growing. Join the elite community of
						athletes using peak data to achieve peak results.
					</p>
					<Link
						href="/auth/signup"
						className="inline-flex items-center space-x-2 px-12 py-6 bg-brand-primary text-black rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_15px_35px_rgba(249,115,22,0.5)]">
						Get Started Now
					</Link>
				</GlassCard>
			</section>

			<footer className="py-12 px-6 border-t border-foreground/5 text-center">
				<p className="text-xs font-black text-foreground/20 uppercase tracking-[0.3em]">
					&copy; 2026 Peak Performance Workout Tracker
				</p>
			</footer>
		</div>
	);
}

function FeatureSection({
	title,
	subtitle,
	description,
	image,
	features,
	reverse = false,
}: {
	title: string;
	subtitle: string;
	description: string;
	image: string;
	features: string[];
	reverse?: boolean;
}) {
	return (
		<div
			className={`max-w-6xl mx-auto px-6 flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-12 md:gap-24`}>
			<div className="flex-1 space-y-6">
				<p className="text-brand-primary text-[10px] font-black uppercase tracking-[0.3em]">
					{subtitle}
				</p>
				<h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase leading-none">
					{title}
				</h2>
				<p className="text-foreground/60 font-medium leading-relaxed max-w-lg">
					{description}
				</p>
				<ul className="space-y-3 pt-4">
					{features.map((feat, i) => (
						<li
							key={i}
							className="flex items-center space-x-3 text-sm font-bold text-foreground/80">
							<CheckCircle2 className="w-5 h-5 text-brand-primary flex-shrink-0" />
							<span>{feat}</span>
						</li>
					))}
				</ul>
			</div>
			<div className="flex-1 w-full group">
				<div className="relative rounded-[2rem] overflow-hidden border border-foreground/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] group-hover:scale-[1.02] transition-transform duration-500">
					<div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
					<img
						src={image}
						alt={title}
						className="w-full aspect-[16/10] object-cover object-top"
					/>
				</div>
			</div>
		</div>
	);
}

function StatBox({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
}) {
	return (
		<div className="flex flex-col items-center justify-center text-center space-y-4">
			<div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/10">
				{icon}
			</div>
			<div>
				<p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">
					{label}
				</p>
				<p className="text-3xl font-black text-foreground tracking-tight">
					{value}
				</p>
			</div>
		</div>
	);
}
