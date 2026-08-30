import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MessagesClient } from "@/components/messages/MessagesClient";
import type { ChatMessage, Conversation } from "@/data/messages";
import { createClient } from "@/lib/supabase/server";
import { resolveProfilePhoto } from "@/lib/profile-photo";

export const metadata: Metadata = { title: "Messages" };

type LikeRow = { liker_id: string; liked_id: string; created_at: string };
type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  photos: string[] | null;
  gender: string | null;
  age: number | null;
  profession: string | null;
  city: string | null;
};
type MessageRow = {
  id: number;
  interest_liker_id: string;
  interest_liked_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

function conversationId(likerId: string, likedId: string) {
  return `${likerId}:${likedId}`;
}

function formatMessageTime(value: string) {
  const date = new Date(value);
  const today = new Date();
  if (date.toDateString() === today.toDateString())
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const days = Math.floor((today.getTime() - date.getTime()) / 86_400_000);
  if (days <= 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString([], { day: "numeric", month: "short" });
}

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/messages");

  const [likesResult, messagesResult] = await Promise.all([
    supabase
      .from("profile_likes")
      .select("liker_id, liked_id, created_at")
      .eq("status", "accepted")
      .or(`liker_id.eq.${user.id},liked_id.eq.${user.id}`)
      .order("created_at", { ascending: false }),
    supabase
      .from("messages")
      .select(
        "id, interest_liker_id, interest_liked_id, sender_id, body, read_at, created_at",
      )
      .order("created_at", { ascending: true }),
  ]);
  if (likesResult.error)
    console.error(
      "Unable to load accepted interests:",
      likesResult.error.message,
    );
  if (messagesResult.error)
    console.error("Unable to load messages:", messagesResult.error.message);

  const likes = (likesResult.data ?? []) as LikeRow[];
  const messageRows = (messagesResult.data ?? []) as MessageRow[];
  const partnerIds = likes.map((like) =>
    like.liker_id === user.id ? like.liked_id : like.liker_id,
  );
  const profileIds = [...new Set([...partnerIds, user.id])];
  const profilesResult = profileIds.length
    ? await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, photos, gender, age, profession, city")
        .in("id", profileIds)
    : { data: [] as ProfileRow[], error: null };
  if (profilesResult.error)
    console.error(
      "Unable to load conversation profiles:",
      profilesResult.error.message,
    );
  const profiles = new Map(
    ((profilesResult.data ?? []) as ProfileRow[]).map((profile) => [
      profile.id,
      profile,
    ]),
  );
  const latestByConversation = new Map<string, MessageRow>();
  const unreadByConversation = new Map<string, number>();
  for (const message of messageRows) {
    const id = conversationId(
      message.interest_liker_id,
      message.interest_liked_id,
    );
    latestByConversation.set(id, message);
    if (message.sender_id !== user.id && !message.read_at)
      unreadByConversation.set(id, (unreadByConversation.get(id) ?? 0) + 1);
  }

  const conversations: Conversation[] = likes
    .map((like, index) => {
      const id = conversationId(like.liker_id, like.liked_id);
      const partnerId =
        like.liker_id === user.id ? like.liked_id : like.liker_id;
      const profile = profiles.get(partnerId);
      const latest = latestByConversation.get(id);
      return {
        id,
        interestLikerId: like.liker_id,
        interestLikedId: like.liked_id,
        partnerId,
        name: profile?.display_name ?? "Bandhanaa Member",
        age: profile?.age ?? 25,
        profession: profile?.profession ?? "Professional",
        city: profile?.city ?? "India",
        avatar: resolveProfilePhoto(profile),
        preview: latest?.body ?? "You matched! Say hello.",
        time: formatMessageTime(latest?.created_at ?? like.created_at),
        unread: unreadByConversation.get(id) ?? 0,
        verified: true,
      };
    })
    .sort((a, b) =>
      (latestByConversation.get(b.id)?.created_at ?? "").localeCompare(
        latestByConversation.get(a.id)?.created_at ?? "",
      ),
    );

  const messages: ChatMessage[] = messageRows.map((message) => ({
    id: String(message.id),
    conversationId: conversationId(
      message.interest_liker_id,
      message.interest_liked_id,
    ),
    sender: message.sender_id === user.id ? "me" : "them",
    senderId: message.sender_id,
    text: message.body,
    time: formatMessageTime(message.created_at),
    createdAt: message.created_at,
    seen: message.sender_id === user.id && Boolean(message.read_at),
  }));
  const viewerName = String(
    user.user_metadata?.full_name ??
      user.user_metadata?.display_name ??
      user.user_metadata?.name ??
      "Member",
  );
  const avatarUrl = resolveProfilePhoto(profiles.get(user.id), String(user.user_metadata?.avatar_url ?? ""));
  return (
    <MessagesClient
      initialConversations={conversations}
      initialMessages={messages}
      currentUserId={user.id}
      viewerName={viewerName}
      avatarUrl={avatarUrl}
    />
  );
}
