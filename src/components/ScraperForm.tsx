import React, { useState, useEffect } from "react";
import { Search, Loader2, CheckCircle2 } from "lucide-react";
import { api } from "../services/api";
import { Job } from "../types";
import { motion, AnimatePresence } from "framer-motion";

export const ScraperForm: React.FC<{ onJobComplete: () => void }> = ({ onJobComplete }) => {
  const [query, setQuery] = useState("");
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentJobId) {
      interval = setInterval(async () => {
        const updatedJob = await api.getJob(currentJobId);
        setJob(updatedJob);
        if (updatedJob.status === "completed") {
          setCurrentJobId(null);
          onJobComplete();
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentJobId, onJobComplete]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await api.scrape(query);
      if ((result as any).error) {
        setError((result as any).error);
      } else {
        setCurrentJobId(result.jobId);
        setQuery("");
      }
    } catch (err) {
      setError("Failed to start scraping. Check your connection.");
      console.error("Scraping error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = job ? Math.round((job.progress / job.total) * 100) : 0;

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl mb-12">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">Start a New Lead Mine</h2>
        <p className="text-slate-500 text-center mb-8">Enter a niche and location to find high-quality leads.</p>
        
        <form onSubmit={handleSubmit} className="relative mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Dentists in Chicago, IL"
              disabled={!!currentJobId}
              className="w-full pl-12 pr-32 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!query.trim() || !!currentJobId || isSubmitting}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Scrape"}
            </button>
          </div>
        </form>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-rose-500 text-sm font-medium text-center mb-4"
          >
            {error}
          </motion.p>
        )}

        <AnimatePresence>
          {job && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    {job.status === "completed" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    )}
                    <span className="font-semibold text-slate-700">
                      {job.status === "completed" ? "Scraping Complete" : `Scraping: ${job.query}`}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-slate-500">
                    {job.progress} / {job.total} Leads
                  </span>
                </div>
                
                <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
                  <motion.div
                    className="bg-blue-600 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-xs text-slate-400 text-center">
                  {job.status === "running" ? "Extracting data from Google Maps..." : "All leads saved to database."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
