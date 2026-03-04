import { useState, useEffect, useCallback } from "react";
import { api } from "./services/api";
import { Lead, Stats as StatsType } from "./types";
import { Stats } from "./components/Stats";
import { ScraperForm } from "./components/ScraperForm";
import { LeadTable } from "./components/LeadTable";
import { Pickaxe, LayoutDashboard, Settings, HelpCircle, LogOut } from "lucide-react";
import { motion } from "framer-motion";

export default function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<StatsType>({ total: 0, enriched: 0, highQuality: 0 });
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [leadsData, statsData, creditsData] = await Promise.all([
        api.getLeads(),
        api.getStats(),
        api.getCredits(),
      ]);
      setLeads(leadsData);
      setStats(statsData);
      setCredits(creditsData.credits);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full">
        <div className="p-8 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl">
            <Pickaxe className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">ProspectMiner</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-semibold transition-all">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </a>
          <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider mt-6">Management</div>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition-all">
            <Settings className="w-5 h-5" />
            Settings
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition-all">
            <HelpCircle className="w-5 h-5" />
            Help Center
          </a>
        </nav>

        <div className="p-6 bg-slate-50 m-4 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Credits</span>
            <span className="text-xs font-black text-blue-600">{credits} left</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 mb-3">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${Math.min((credits / 500) * 100, 100)}%` }} />
          </div>
          <button className="w-full py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all">
            Top Up Credits
          </button>
        </div>

        <div className="p-4 border-t border-slate-100">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-xl font-medium transition-all">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-12">
        <header className="flex justify-between items-center mb-12">
          <div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-black text-slate-900 mb-2"
            >
              Lead Intelligence
            </motion.h2>
            <p className="text-slate-500 font-medium">Manage and enrich your domain-specific leads with AI.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-bold text-slate-700">{credits} Credits Available</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">Manisha K.</p>
                <p className="text-xs text-slate-500">Premium Plan</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 border-4 border-white shadow-lg" />
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="max-w-6xl">
            <Stats stats={stats} />
            <ScraperForm onJobComplete={fetchData} />
            <LeadTable leads={leads} onEnrich={fetchData} />
          </div>
        )}
      </main>
    </div>
  );
}
