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
  bio: string;
  image: string;
  match: number;
  relationship: "none" | "outgoing_pending" | "incoming_pending" | "following";
};
