export type InterestStatus = "new" | "accepted" | "pending" | "declined";
export type InterestTab = "all" | "sent" | "received" | "responded";

export interface InterestProfile {
  id: string;
  profileId: string;
  name: string;
  age: number;
  occupation: string;
  location: string;
  time?: string;
  dateText?: string;
  status: InterestStatus;
  verified: boolean;
  image: string;
  compatibility?: number;
  height?: string;
  religion?: string;
  motherTongue?: string;
  online?: boolean;
}
