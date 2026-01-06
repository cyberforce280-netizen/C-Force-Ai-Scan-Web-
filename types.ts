
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

/**
 * User data for authentication and profile management
 */
export interface UserData {
  username: string;
  name: string;
  role: string;
  level: string;
  hasFaceId?: boolean;
  faceImage?: string;
  lastLogin?: string | number;
}

export type ViewState = 'DASHBOARD' | 'THREAT_INTEL' | 'OSINT' | 'NETWORK' | 'VULN_SCAN' | 'DDOS' | 'ADMIN_PANEL';

export enum OsintSubSection {
  DOMAIN = 'Domain & Infrastructure',
  WEB = 'Web Intelligence',
  FOOTPRINT = 'Digital Footprint',
  REPUTATION = 'Reputation & Trust',
  CONTEXT = 'Contextual Intelligence'
}
