import React from "react";
import { Users, CheckCircle, Star } from "lucide-react";
import { Stats as StatsType } from "../types";
import { motion, AnimatePresence } from "framer-motion";

interface StatsProps {
  stats: StatsType;
}

export const Stats: React.FC<StatsProps> = ({ stats }) => {
  const cards = [
    { label: "Total Leads", value: stats.total, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "AI Enriched", value: stats.enriched, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "High Quality", value: stats.highQuality, icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${card.bg}`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{card.value}</h3>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
