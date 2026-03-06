import { GlassCard } from "@/components/ui/GlassCard";
import { User, Bell, Shield, CircleHelp, LogOut, ChevronRight, Settings, CreditCard, LayoutDashboard, BarChart2 } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const sections = [
    {
      title: "Account",
      items: [
        { icon: <User className="w-5 h-5" />, label: "Personal Information", value: "Lokesh Choudhary" },
        { icon: <CreditCard className="w-5 h-5" />, label: "Subscription", value: "Pro Plan" },
      ]
    },
    {
      title: "Settings",
      items: [
        { icon: <Bell className="w-5 h-5" />, label: "Notifications", toggle: true },
        { icon: <Shield className="w-5 h-5" />, label: "Privacy & Security" },
        { icon: <Settings className="w-5 h-5" />, label: "Preferences" },
      ]
    },
    {
      title: "Support",
      items: [
        { icon: <CircleHelp className="w-5 h-5" />, label: "Help Center" },
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen pb-24 md:pb-0 md:pl-20">
      <header className="px-6 py-8">
        <h1 className="text-2xl font-black text-white tracking-tight">Profile</h1>
      </header>

      <main className="flex-1 px-6 space-y-6 max-w-2xl mx-auto w-full">
        {/* Profile Header Card */}
        <GlassCard className="flex items-center space-x-6 py-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl border-2 border-accent/50 p-1">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Lokesh" 
                alt="Profile" 
                className="w-full h-full rounded-2xl object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-full border-4 border-brand-bg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Lokesh Choudhary</h2>
            <p className="text-white/40 text-sm font-medium">Joined March 2024</p>
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-accent/20 text-accent uppercase tracking-widest border border-accent/30">
                Level 12
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/5 text-white/60 uppercase tracking-widest border border-white/10">
                Pro
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Sections */}
        {sections.map((section, idx) => (
          <section key={idx} className="space-y-3">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] ml-2">
              {section.title}
            </h3>
            <div className="space-y-2">
              {section.items.map((item, itemIdx) => (
                <GlassCard key={itemIdx} className="p-4 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 group-hover:text-accent group-hover:bg-accent/10 transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{item.label}</p>
                      {item.value && <p className="text-[10px] text-white/40 font-medium">{item.value}</p>}
                    </div>
                  </div>
                  {item.toggle ? (
                    <div className="w-10 h-6 rounded-full bg-accent/20 border border-accent/30 relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-accent rounded-full" />
                    </div>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                  )}
                </GlassCard>
              ))}
            </div>
          </section>
        ))}

        {/* Logout Button */}
        <button className="w-full glass-card border-rose-500/20 hover:bg-rose-500/10 transition-colors flex items-center justify-center space-x-2 py-4 mt-8">
          <LogOut className="w-5 h-5 text-rose-500" />
          <span className="text-sm font-bold text-rose-500 uppercase tracking-widest">Log Out</span>
        </button>
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 glass border-t border-white/10 flex justify-around items-center px-6 md:hidden">
        <Link href="/" className="flex flex-col items-center text-white/40 hover:text-white transition-colors">
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1 uppercase tracking-widest">Home</span>
        </Link>
        <Link href="/analytics" className="flex flex-col items-center text-white/40 hover:text-white transition-colors">
          <BarChart2 className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1 uppercase tracking-widest">Stats</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center text-accent">
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1 uppercase tracking-widest">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
