export type RelationshipUIState =
  | "none"
  | "outgoing_pending"
  | "incoming_pending"
  | "following";

export type RelationshipRecord = {
  liker_id: string;
  liked_id: string;
  status: "pending" | "accepted" | "declined";
};

export function getRelationshipState(
  relationship: RelationshipRecord | null | undefined,
  currentUserId: string,
): RelationshipUIState {
  if (!relationship || relationship.status === "declined") return "none";
  if (relationship.status === "accepted") return "following";
  if (relationship.liker_id === currentUserId) return "outgoing_pending";
  if (relationship.liked_id === currentUserId) return "incoming_pending";
  return "none";
}

export interface ProfileDetail {
  id: string;
  name: string;
  age: number;
  birthDate: string;
  occupation: string;
  company: string;
  location: string;
  gender: string;
  weight: string;
  height: string;
  religion: string;
  motherTongue: string;
  education: string;
  maritalStatus: string;
  memberSince: string;
  about: string;
  quote: string;
  verified: boolean;
  online: boolean;
  image: string;
  photos: string[];
  interests: string[];
  lifestyle: Array<{ label: string; value: string }>;
  family: Array<{ label: string; value: string }>;
  preferences: Array<{ label: string; value: string }>;
  horoscope: Array<{ label: string; value: string }>;
  compatibility: number;
}

export type CompactProfile = Pick<
  ProfileDetail,
  "id" | "name" | "age" | "location" | "image" | "verified"
>;
