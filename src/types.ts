export interface Lead {
  id: number;
  name: string;
  address: string;
  website: string;
  phone: string;
  category: string;
  services: string;
  owner_name: string;
  email_guess: string;
  score: 'High' | 'Medium' | 'Low' | null;
  status: 'pending' | 'enriched';
  created_at: string;
}

export interface Job {
  id: string;
  query: string;
  status: 'pending' | 'running' | 'completed';
  progress: number;
  total: number;
  created_at: string;
}

export interface Stats {
  total: number;
  enriched: number;
  highQuality: number;
}
