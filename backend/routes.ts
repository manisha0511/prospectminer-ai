import express from "express";
import db from "./database.ts";
import { enrichLeadWithAI } from "./aiService.ts";
import axios from "axios";
import * as cheerio from "cheerio";
import { createObjectCsvStringifier } from "csv-writer";

const router = express.Router();

// Mock Scraper for Google Maps
async function simulateScraping(jobId: string, query: string) {
  const total = 15;
  db.prepare("UPDATE jobs SET total = ?, status = 'running' WHERE id = ?").run(total, jobId);

  const mockLeads = [
    { name: "Chicago Dental Care", address: "123 Michigan Ave, Chicago, IL", website: "https://chicagodental.com", phone: "312-555-0101" },
    { name: "Windy City Smiles", address: "456 Wacker Dr, Chicago, IL", website: "https://windycitysmiles.net", phone: "312-555-0102" },
    { name: "Lakefront Dentistry", address: "789 Lake Shore Dr, Chicago, IL", website: "https://lakefrontdentistry.org", phone: "312-555-0103" },
    { name: "Magnificent Mile Ortho", address: "101 N Michigan Ave, Chicago, IL", website: "https://magmileortho.com", phone: "312-555-0104" },
    { name: "Loop Dental Group", address: "202 S State St, Chicago, IL", website: "https://loopdental.com", phone: "312-555-0105" },
    { name: "River North Dental", address: "303 W Erie St, Chicago, IL", website: "https://rivernorthdental.com", phone: "312-555-0106" },
    { name: "Gold Coast Family Dental", address: "404 N Rush St, Chicago, IL", website: "https://goldcoastdental.com", phone: "312-555-0107" },
    { name: "West Loop Dental", address: "505 W Madison St, Chicago, IL", website: "https://westloopdental.com", phone: "312-555-0108" },
    { name: "South Loop Smiles", address: "606 S Michigan Ave, Chicago, IL", website: "https://southloopsmiles.com", phone: "312-555-0109" },
    { name: "Lincoln Park Dental", address: "707 W Fullerton Pkwy, Chicago, IL", website: "https://lincolnparkdental.com", phone: "312-555-0110" },
    { name: "Wicker Park Dentistry", address: "808 N Milwaukee Ave, Chicago, IL", website: "https://wickerparkdentistry.com", phone: "312-555-0111" },
    { name: "Bucktown Dental", address: "909 N Damen Ave, Chicago, IL", website: "https://bucktowndental.com", phone: "312-555-0112" },
    { name: "Logan Square Smiles", address: "1010 N Milwaukee Ave, Chicago, IL", website: "https://logansquaresmiles.com", phone: "312-555-0113" },
    { name: "Avondale Dental", address: "1111 N Elston Ave, Chicago, IL", website: "https://avondaledental.com", phone: "312-555-0114" },
    { name: "Irving Park Family Dental", address: "1212 W Irving Park Rd, Chicago, IL", website: "https://irvingparkdental.com", phone: "312-555-0115" },
  ];

  for (let i = 0; i < total; i++) {
    const lead = mockLeads[i];
    const currentCredits = db.prepare("SELECT value FROM settings WHERE key = 'credits'").get() as any;
    if (parseInt(currentCredits.value) > 0) {
      db.prepare("UPDATE settings SET value = ? WHERE key = 'credits'").run((parseInt(currentCredits.value) - 1).toString());
      db.prepare(`
        INSERT INTO leads (name, address, website, phone, status)
        VALUES (?, ?, ?, ?, 'pending')
      `).run(lead.name, lead.address, lead.website, lead.phone);
    }
    db.prepare("UPDATE jobs SET progress = ? WHERE id = ?").run(i + 1, jobId);
    await new Promise(r => setTimeout(r, 500));
  }
  db.prepare("UPDATE jobs SET status = 'completed' WHERE id = ?").run(jobId);
}

// Routes
router.get("/credits", (req, res) => {
  const credits = db.prepare("SELECT value FROM settings WHERE key = 'credits'").get() as any;
  res.json({ credits: parseInt(credits.value) });
});

router.post("/scrape", (req, res) => {
  const { query } = req.body;
  const credits = db.prepare("SELECT value FROM settings WHERE key = 'credits'").get() as any;
  if (parseInt(credits.value) < 15) return res.status(403).json({ error: "Insufficient credits" });
  const jobId = Math.random().toString(36).substring(7);
  db.prepare("INSERT INTO jobs (id, query, status) VALUES (?, ?, 'pending')").run(jobId, query);
  simulateScraping(jobId, query);
  res.json({ jobId });
});

router.get("/jobs/:id", (req, res) => {
  const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(req.params.id);
  res.json(job);
});

router.get("/leads", (req, res) => {
  const leads = db.prepare("SELECT * FROM leads ORDER BY created_at DESC").all();
  res.json(leads);
});

router.post("/leads/:id/enrich", async (req, res) => {
  const leadId = req.params.id;
  const lead = db.prepare("SELECT * FROM leads WHERE id = ?").get(leadId) as any;
  if (!lead || !lead.website) return res.status(400).json({ error: "No website found" });

  try {
    let websiteText = "";
    try {
      const response = await axios.get(lead.website, { timeout: 5000 });
      const $ = cheerio.load(response.data);
      $('script, style').remove();
      websiteText = $('body').text().substring(0, 5000);
    } catch (e) {
      websiteText = "Could not fetch content.";
    }

    const enrichment = await enrichLeadWithAI(lead, websiteText);
    db.prepare(`
      UPDATE leads 
      SET category = ?, services = ?, owner_name = ?, email_guess = ?, score = ?, status = 'enriched'
      WHERE id = ?
    `).run(enrichment.category, enrichment.services, enrichment.ownerName, enrichment.emailGuess, enrichment.score, leadId);

    res.json({ success: true, enrichment });
  } catch (error) {
    res.status(500).json({ error: "Failed to enrich" });
  }
});

router.get("/stats", (req, res) => {
  const total = db.prepare("SELECT COUNT(*) as count FROM leads").get() as any;
  const enriched = db.prepare("SELECT COUNT(*) as count FROM leads WHERE status = 'enriched'").get() as any;
  const highQuality = db.prepare("SELECT COUNT(*) as count FROM leads WHERE score = 'High'").get() as any;
  res.json({ total: total.count, enriched: enriched.count, highQuality: highQuality.count });
});

router.get("/export", (req, res) => {
  const leads = db.prepare("SELECT * FROM leads").all();
  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: "name", title: "Name" },
      { id: "address", title: "Address" },
      { id: "website", title: "Website" },
      { id: "phone", title: "Phone" },
      { id: "category", title: "Category" },
      { id: "services", title: "Services" },
      { id: "owner_name", title: "Owner" },
      { id: "email_guess", title: "Email Guess" },
      { id: "score", title: "Score" },
    ],
  });
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=leads.csv");
  res.send(csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(leads));
});

export default router;
