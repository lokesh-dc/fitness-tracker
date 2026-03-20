import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { AdherenceScore } from '@/types/workout';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AdherenceScoreWidgetProps {
  adherenceScore: AdherenceScore;
}

export const AdherenceScoreWidget: React.FC<AdherenceScoreWidgetProps> = ({
  adherenceScore,
}) => {
  if (!adherenceScore.hasActivePlans) return null;

  const getPercentColor = (percent: number) => {
    if (percent >= 80) return 'text-emerald-500';
    if (percent >= 50) return 'text-orange-500';
    return 'text-rose-500';
  };

  const getTrendIcon = () => {
    if (adherenceScore.trendDirection === 'up') return <TrendingUp className="w-3 h-3 text-emerald-500" />;
    if (adherenceScore.trendDirection === 'down') return <TrendingDown className="w-3 h-3 text-rose-500" />;
    return <Minus className="w-3 h-3 text-foreground/40" />;
  };

  const getTrendColor = () => {
    if (adherenceScore.trendDirection === 'up') return 'text-emerald-500';
    if (adherenceScore.trendDirection === 'down') return 'text-rose-500';
    return 'text-foreground/40';
  };

  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-black uppercase text-foreground/40 tracking-widest px-1">
        Plan Adherence
      </h3>
      
      <GlassCard className="p-6 flex flex-col items-center justify-center text-center space-y-4">
        <div className="space-y-0.5">
          <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">
            Last 4 weeks
          </p>
          <div className={cn("text-4xl font-black tracking-tight", getPercentColor(adherenceScore.percent))}>
            {adherenceScore.percent}%
          </div>
        </div>

        <div className={cn("flex items-center gap-1.5 py-1 px-3 rounded-full bg-foreground/5 font-black text-[10px] uppercase tracking-wider", getTrendColor())}>
          {getTrendIcon()}
          <span>{adherenceScore.trend}% vs last month</span>
        </div>
      </GlassCard>
    </div>
  );
};
