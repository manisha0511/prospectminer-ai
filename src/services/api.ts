import { Lead, Job, Stats } from "../types";

export const api = {
  async scrape(query: string): Promise<{ jobId: string }> {
    const res = await fetch("/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    return res.json();
  },

  async getJob(id: string): Promise<Job> {
    const res = await fetch(`/api/jobs/${id}`);
    return res.json();
  },

  async getLeads(): Promise<Lead[]> {
    const res = await fetch("/api/leads");
    return res.json();
  },

  async enrichLead(id: number): Promise<{ success: boolean }> {
    const res = await fetch(`/api/leads/${id}/enrich`, { method: "POST" });
    return res.json();
  },

  async getStats(): Promise<Stats> {
    const res = await fetch("/api/stats");
    return res.json();
  },

  async getCredits(): Promise<{ credits: number }> {
    const res = await fetch("/api/credits");
    return res.json();
  },

  exportUrl: "/api/export",
};
