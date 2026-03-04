import React, { useState } from "react";
import { ExternalLink, Mail, User, ShieldCheck, Zap, Download, Loader2 } from "lucide-react";
import { Lead } from "../types";
import { api } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

interface LeadTableProps {
  leads: Lead[];
  onEnrich: () => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({ leads, onEnrich }) => {
  const [enrichingId, setEnrichingId] = useState<number | null>(null);

  const handleEnrich = async (id: number) => {
    setEnrichingId(id);
    try {
      await api.enrichLead(id);
      onEnrich();
    } catch (error) {
      console.error("Enrichment error:", error);
    } finally {
      setEnrichingId(null);
    }
  };

  const getScoreBadge = (score: string | null) => {
    switch (score) {
      case "High": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Medium": return "bg-amber-100 text-amber-700 border-amber-200";
      case "Low": return "bg-rose-100 text-rose-700 border-rose-200";
      default: return "bg-slate-100 text-slate-500 border-slate-200";
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-900">Recent Leads</h3>
        <a
          href={api.exportUrl}
          className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </a>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Business Info</th>
              <th className="px-6 py-4 font-semibold">AI Enrichment</th>
              <th className="px-6 py-4 font-semibold">Score</th>
              <th className="px-6 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <AnimatePresence mode="popLayout">
              {leads.map((lead) => (
                <motion.tr
                  key={lead.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-slate-900 text-base">{lead.name}</span>
                      <span className="text-sm text-slate-500 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> {lead.address}
                      </span>
                      {lead.website && (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1"
                        >
                          <ExternalLink className="w-3 h-3" /> {new URL(lead.website).hostname}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    {lead.status === "enriched" ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm font-medium text-slate-700">{lead.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span className="text-xs text-slate-500 font-mono">{lead.email_guess || "N/A"}</span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 italic">
                          {lead.services}
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Not enriched yet</span>
                    )}
                  </td>
                  <td className="px-6 py-6">
                    {lead.score ? (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getScoreBadge(lead.score)}`}>
                        {lead.score}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-6 py-6">
                    {lead.status !== "enriched" ? (
                      <button
                        onClick={() => handleEnrich(lead.id)}
                        disabled={enrichingId === lead.id}
                        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                      >
                        {enrichingId === lead.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                        )}
                        {enrichingId === lead.id ? "Enriching..." : "AI Enrich"}
                      </button>
                    ) : (
                      <button className="text-slate-400 cursor-default flex items-center gap-2 px-4 py-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-semibold">Verified</span>
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {leads.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-slate-400 font-medium">No leads found. Start a search to mine data.</p>
          </div>
        )}
      </div>
    </div>
  );
};
