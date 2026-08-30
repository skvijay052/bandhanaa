export interface PrivacySettings {
  userId: string;
  profileVisibility: "everyone" | "matches" | "private";
  lastSeenVisibility: "everyone" | "matches" | "nobody";
  readReceipts: boolean;
  showOnlineStatus: boolean;
  hideAge: boolean;
  twoStepVerification: boolean;
}
export interface ReportTarget {
  id: string;
  name: string;
  age: number;
  city: string;
  profession: string;
  company: string;
  avatar: string;
  verified: boolean;
}
