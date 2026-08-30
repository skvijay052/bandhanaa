export interface MatchProfile {
  id: string;
  name: string;
  age: number;
  city: string;
  state: string;
  occupation: string;
  company?: string;
  height: string;
  religion: string;
  language: string;
  compatibility: number;
  verified: boolean;
  image: string;
}

export type MatchTab = "all" | "shortlisted" | "sent" | "received";

export const matchTabs: Array<{
  id: MatchTab;
  desktopLabel: string;
  mobileLabel: string;
}> = [
  { id: "all", desktopLabel: "All Matches", mobileLabel: "All" },
  {
    id: "shortlisted",
    desktopLabel: "Shortlisted",
    mobileLabel: "Shortlisted",
  },
  { id: "sent", desktopLabel: "Requests Sent", mobileLabel: "Sent" },
  {
    id: "received",
    desktopLabel: "Requests Received",
    mobileLabel: "Received",
  },
];
