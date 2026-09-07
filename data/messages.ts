export type ConversationFilter = "all" | "unread" | "favourites";

export type Conversation = {
  id: string;
  interestLikerId: string;
  interestLikedId: string;
  partnerId: string;
  name: string;
  age: number;
  profession: string;
  city: string;
  avatar: string;
  preview: string;
  time: string;
  unread: number;
  verified: boolean;
  favourite?: boolean;
  archived?: boolean;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  sender: "me" | "them";
  senderId: string;
  text: string;
  time: string;
  createdAt: string;
  seen?: boolean;
};
