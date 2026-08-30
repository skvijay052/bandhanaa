export type ConnectionStatus =
  "active" | "pending" | "our-connection" | "blocked";
export interface ConnectionProfile {
  id: string;
  name: string;
  age: number;
  profession: string;
  location: string;
  image: string;
  verified: boolean;
  online?: boolean;
  status: ConnectionStatus;
  interestLikerId: string;
  interestLikedId: string;
  requestDirection?: "received" | "sent";
}
