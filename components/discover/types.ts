export type DiscoverProfile = {
  id: string;
  name: string;
  age: number;
  job: string;
  city: string;
  maritalStatus: string;
  height: string;
  religion: string;
  motherTongue: string;
  education: string;
  bio: string;
  image: string;
  photoCount: number;
  match: number;
  online: boolean;
  relationship: "none" | "outgoing_pending" | "incoming_pending" | "following";
};
