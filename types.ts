
export enum ThreatLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface IntelligenceItem {
  id: string;
  timestamp: string;
  source: string;
  type: string;
  value: string; // IP, Domain, Hash
  level: ThreatLevel;
  campaign?: string;
  region: string;
}

export interface OsintData {
  domain: string;
  registrar: string;
  createdDate: string;
  subdomains: string[];
  exposedPorts: number[];
  techStack: string[];
  reputationScore: number; // 0-100
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isThinking?: boolean;
}

export type ViewState = 'DASHBOARD' | 'THREAT_INTEL' | 'OSINT' | 'NETWORK' | 'VULN_SCAN' | 'ADMIN_PANEL';

export enum OsintSubSection {
  DOMAIN = 'Domain & Infrastructure',
  WEB = 'Web Intelligence',
  FOOTPRINT = 'Digital Footprint',
  REPUTATION = 'Reputation & Trust',
  CONTEXT = 'Contextual Intelligence'
}
