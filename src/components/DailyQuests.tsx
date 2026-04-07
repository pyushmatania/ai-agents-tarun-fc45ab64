import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, Zap, Diamond } from "lucide-react";
import type { DailyQuest } from "@/hooks/useGamification";

interface DailyQuestsProps {
  quests: DailyQuest[];
}

const DailyQuests = ({ quests }: DailyQuestsProps) => {
  return (
    <div className="bg-card rounded-2xl p-3.5 border border-border/40 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-xl bg-agni-gold flex items-center justify-center">
          <Sparkles size={14} className="text-white" />
        </div>
        <h4 className="text-xs font-extrabold text-foreground">Daily Quests</h4>
        <div className="ml-auto text-[9px] font-bold text-muted-foreground">
          {quests.filter(q => q.current >= q.target).length}/{quests.length} done
        </div>
      </div>

      <div className="space-y-2">
        {quests.map((quest, i) => {
          const completed = quest.current >= quest.target;
          const progress = Math.min((quest.current / quest.target) * 100, 100);

          return (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-xl p-2.5 border transition-all ${
                completed
                  ? "bg-agni-green/10 border-agni-green/30"
                  : "bg-muted/20 border-border/30"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{quest.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-[11px] font-extrabold ${completed ? "text-agni-green" : "text-foreground"}`}>
                      {quest.title}
                    </p>
                    {completed && <CheckCircle2 size={12} className="text-agni-green" />}
                  </div>
                  <p className="text-[9px] text-muted-foreground font-semibold">{quest.description}</p>
                  {/* Progress bar */}
                  <div className="mt-1.5 h-1.5 bg-muted/40 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${completed ? "bg-agni-green" : "bg-agni-gold"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                    />
                  </div>
                  <p className="text-[8px] text-muted-foreground mt-0.5 font-bold">
                    {quest.current}/{quest.target}
                  </p>
                </div>
                {/* Rewards */}
                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  <div className="flex items-center gap-0.5">
                    <Zap size={8} className="text-agni-green" />
                    <span className="text-[8px] font-black text-agni-green">+{quest.xpReward}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Diamond size={8} className="text-agni-gold" />
                    <span className="text-[8px] font-black text-agni-gold">+{quest.gemsReward}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyQuests;
