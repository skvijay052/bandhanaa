"use client";

import { ProfileImage } from "@/components/ui/ProfileImage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Bell,
  CheckCheck,
  ArrowLeft,
  ChevronRight,
  Info,
  MapPin,
  Mic,
  Reply,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  SquarePen,
  X,
} from "lucide-react";

import {
  type ChatMessage,
  type Conversation,
  type ConversationFilter,
} from "@/data/messages";
import { createClient } from "@/lib/supabase/client";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Brand } from "@/components/auth/Brand";

export function MessagesClient({ initialConversations, initialMessages, currentUserId, viewerName, avatarUrl, readReceipts }: { initialConversations: Conversation[]; initialMessages: ChatMessage[]; currentUserId: string; viewerName: string; avatarUrl: string; readReceipts: boolean; }) {
  const router = useRouter();
  const [filter, setFilter] = useState<ConversationFilter>("all");
  const [query, setQuery] = useState("");
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState(initialConversations[0]?.id ?? "");
  const [chat, setChat] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const visible = useMemo(() => conversations.filter((item) => {
    const matches = `${item.name} ${item.preview} ${item.profession}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "all" || (filter === "unread" && item.unread > 0) || (filter === "favourites" && item.favourite === true);
    return matches && matchesFilter;
  }), [conversations, filter, query]);
  const selected = conversations.find((item) => item.id === selectedId) ?? conversations[0];
  const unread = conversations.reduce((sum, item) => sum + item.unread, 0);
  const selectedMessages = selected ? chat.filter((message) => message.conversationId === selected.id) : [];

  useEffect(() => { setConversations(initialConversations); setChat(initialMessages); setSelectedId((current) => initialConversations.some((item) => item.id === current) ? current : (initialConversations[0]?.id ?? "")); }, [initialConversations, initialMessages]);
  useEffect(() => { setReplyingTo(null); }, [selectedId]);
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`messages:${currentUserId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const row = payload.new as { id: number; interest_liker_id: string; interest_liked_id: string; sender_id: string; body: string; read_at: string | null; created_at: string; reply_to_id?: number | null; };
        const id = `${row.interest_liker_id}:${row.interest_liked_id}`;
        const message: ChatMessage = { id: String(row.id), conversationId: id, sender: row.sender_id === currentUserId ? "me" : "them", senderId: row.sender_id, text: row.body, time: formatTime(row.created_at), createdAt: row.created_at, seen: Boolean(row.read_at), replyToId: row.reply_to_id ? String(row.reply_to_id) : null };
        setChat((items) => items.some((item) => item.id === message.id) ? items : [...items, message]);
        setConversations((items) => items.map((conversation) => conversation.id === id ? { ...conversation, preview: row.body, time: formatTime(row.created_at), unread: row.sender_id !== currentUserId ? conversation.unread + 1 : conversation.unread } : conversation));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profile_likes" }, (payload) => {
        const row = payload.new as { liker_id: string; liked_id: string; status: string; };
        if (row.status === "accepted" && (row.liker_id === currentUserId || row.liked_id === currentUserId)) router.refresh();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "profile_shortlists", filter: `user_id=eq.${currentUserId}` }, () => router.refresh())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [currentUserId, router]);

  useEffect(() => {
    if (!readReceipts || !selected || selected.unread === 0) return;
    const supabase = createClient();
    void supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("interest_liker_id", selected.interestLikerId).eq("interest_liked_id", selected.interestLikedId).neq("sender_id", currentUserId).is("read_at", null).then(({ error }) => {
      if (!error) setConversations((items) => items.map((item) => item.id === selected.id ? { ...item, unread: 0 } : item));
    });
  }, [currentUserId, readReceipts, selected]);

  async function sendMessage() {
    const text = draft.trim();
    if (!text || !selected) return;
    const reply = replyingTo;
    setNotice("");
    setDraft("");
    const supabase = createClient();
    const payload = {
      interest_liker_id: selected.interestLikerId,
      interest_liked_id: selected.interestLikedId,
      sender_id: currentUserId,
      body: text,
      ...(reply ? { reply_to_id: reply.id } : {}),
    };
    const { data, error } = await supabase.from("messages").insert(payload).select("*").single();
    if (error) {
      setDraft(text);
      setNotice(error.code === "42501" ? "You can message only after an interest is accepted." : "Message could not be sent. Please try again.");
      return;
    }
    const row = data as { id: number; body: string; read_at: string | null; created_at: string; reply_to_id?: number | null; };
    const message: ChatMessage = { id: String(row.id), conversationId: selected.id, sender: "me", senderId: currentUserId, text: row.body, time: formatTime(row.created_at), createdAt: row.created_at, seen: Boolean(row.read_at), replyToId: row.reply_to_id ? String(row.reply_to_id) : (reply?.id ?? null) };
    setChat((items) => items.some((item) => item.id === message.id) ? items : [...items, message]);
    setConversations((items) => items.map((item) => item.id === selected.id ? { ...item, preview: message.text, time: message.time } : item));
    setReplyingTo(null);
  }

  return <div className="h-dvh overflow-hidden bg-white"><div className="app-shell"><AppSidebar active="Messages" hideMobileNavigation={mobileChatOpen} /><div className="grid min-w-0 flex-1 md:grid-cols-[390px_minmax(0,1fr)] xl:grid-cols-[430px_minmax(0,1fr)]"><ConversationPanel filter={filter} setFilter={setFilter} query={query} setQuery={setQuery} visible={visible} selectedId={selectedId} setSelectedId={(id) => { setSelectedId(id); setMobileChatOpen(true); }} mobileChatOpen={mobileChatOpen} unread={unread} viewerName={viewerName} />{selected ? <ChatPanel selected={selected} chat={selectedMessages} draft={draft} setDraft={setDraft} sendMessage={sendMessage} notice={notice} mobileOpen={mobileChatOpen} onBack={() => setMobileChatOpen(false)} onDetails={() => setDetailsOpen((open) => !open)} replyingTo={replyingTo} onReply={setReplyingTo} onCancelReply={() => setReplyingTo(null)} /> : <EmptyChat />}{selected && detailsOpen ? <ProfileDetails conversation={selected} onClose={() => setDetailsOpen(false)} /> : null}</div></div></div>;
}

function ConversationPanel({ filter, setFilter, query, setQuery, visible, selectedId, setSelectedId, mobileChatOpen, unread, viewerName }: { filter: ConversationFilter; setFilter: (value: ConversationFilter) => void; query: string; setQuery: (value: string) => void; visible: Conversation[]; selectedId: string; setSelectedId: (id: string) => void; mobileChatOpen: boolean; unread: number; viewerName: string; }) {
  return <section className={`relative min-w-0 overflow-hidden border-r border-[#dbdfe4] bg-white max-md:bg-[#fbfcff] ${mobileChatOpen ? "max-md:hidden" : ""}`}>
    <div className="pointer-events-none absolute -left-28 -top-24 size-[420px] rounded-full bg-[#dff9f3]/80 blur-2xl md:hidden" /><div className="pointer-events-none absolute -right-40 top-12 size-[400px] rounded-full bg-[#eee7ff]/80 blur-2xl md:hidden" />
    <div className="relative px-7 pb-4 pt-7 max-md:px-4 max-md:pb-3 max-md:pt-5">
      <div className="hidden items-center justify-between md:flex"><h1 className="truncate text-[20px] font-bold tracking-[-.02em] text-[#0f1419]">{viewerName}</h1><button aria-label="New message" className="grid size-11 place-items-center rounded-full text-[#0f1419] transition hover:bg-[#f0f2f5]"><SquarePen size={24} /></button></div>
      <div className="flex items-center justify-between md:hidden"><Brand compact /><Link href="/notifications" aria-label="Notifications" className="relative grid size-11 place-items-center rounded-[15px] bg-white/90 shadow-[0_7px_22px_rgba(15,20,25,.07)]"><Bell size={22} strokeWidth={1.8} /><span className="absolute right-2 top-2 size-2 rounded-full bg-[#8b3de8] ring-2 ring-white" /></Link></div>
      <div className="mt-6 md:hidden"><h1 className="text-[27px] font-bold tracking-[-.035em] text-[#0f1419]">Messages</h1><p className="mt-1 text-[13px] text-[#687684]">Your conversations</p></div>
      <label className="mt-5 flex h-12 items-center gap-3 rounded-full bg-[#f1f3f5] px-5 text-[#667781] max-md:bg-white/95 max-md:shadow-[0_8px_28px_rgba(63,38,110,.07)]"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-[#777c91]" placeholder="Search messages" /><SlidersHorizontal size={18} className="md:hidden" /></label>
      <div className="mt-7 hidden items-center justify-between md:flex"><h2 className="text-[18px] font-bold">Messages</h2><button onClick={() => setFilter(filter === "unread" ? "all" : "unread")} className={`text-[14px] font-semibold ${filter === "unread" ? "text-[#f34ca4]" : "text-[#536471]"}`}>Unread{unread ? ` (${unread})` : ""}</button></div>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 md:hidden"><FilterPill active={filter === "all"} onClick={() => setFilter("all")}>All</FilterPill><FilterPill active={filter === "unread"} onClick={() => setFilter("unread")}>Unread{unread ? <span className="ml-1 grid size-5 place-items-center rounded-full bg-[#f34ca4] text-[9px] text-white">{unread}</span> : null}</FilterPill><FilterPill active={filter === "favourites"} onClick={() => setFilter("favourites")}>Favourites</FilterPill></div>
    </div>
    <div className="relative h-[calc(100dvh-190px)] overflow-y-auto px-3 pb-28 max-md:h-[calc(100dvh-250px)] md:pb-4">{visible.length ? visible.map((item) => <ConversationRow key={item.id} item={item} active={item.id === selectedId} onClick={() => setSelectedId(item.id)} />) : <p className="p-8 text-center text-sm leading-6 text-[#777c91]">{filter === "favourites" ? "No shortlisted conversations yet." : query || filter !== "all" ? "No messages found." : "No one you follow yet. Once a follow request is accepted, you can message each other here."}</p>}</div>
  </section>;
}

function ConversationRow({ item, active, onClick }: { item: Conversation; active: boolean; onClick: () => void; }) {
  return <button onClick={onClick} className={`group relative mb-3 flex min-h-[112px] w-full items-center gap-4 overflow-hidden rounded-[24px] border border-transparent px-4 py-3.5 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8b3de8] max-md:bg-white max-md:shadow-[0_10px_30px_rgba(42,35,70,.09)] ${active ? "md:bg-[#f1f3f5]" : "md:bg-white md:hover:bg-[#f7f9f9]"}`}><span className="relative size-[82px] shrink-0 overflow-hidden rounded-full bg-[#e8e9ec] md:size-[64px]"><ProfileImage src={item.avatar} alt={item.name} fill sizes="(max-width: 767px) 82px, 64px" className="object-cover" /><span className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/30 to-transparent md:hidden" /></span><span className="min-w-0 flex-1 py-0.5"><span className="flex min-w-0 items-center gap-1.5 pr-8"><strong className="truncate text-[16px] font-bold tracking-[-.01em] text-[#111b21]">{item.name}{item.age ? `, ${item.age}` : ""}</strong>{item.verified ? <BadgeCheck size={17} className="shrink-0 fill-[#1d9bf0] text-[#1d9bf0] [&>path:last-child]:text-white" aria-label="Verified" /> : null}{active ? <span className="ml-auto size-1.5 rounded-full bg-[#1d9bf0] md:block max-md:hidden" /> : null}</span><span className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] font-medium text-[#687184] md:hidden"><span className="truncate">{item.profession}</span>{item.city ? <><span className="text-[#c4c7cd]">•</span><span className="flex min-w-0 items-center gap-1 truncate"><MapPin size={11} className="shrink-0 text-[#8b3de8]" /><span className="truncate">{item.city}</span></span></> : null}</span><span className={`mt-2 block truncate text-[13px] ${item.unread ? "font-semibold text-[#252936]" : "text-[#667781]"}`}>{item.preview || "Start a conversation"}</span><span className="mt-1.5 block text-[10px] font-medium text-[#9aa1ad] md:hidden">{item.time}</span></span><span className="flex shrink-0 flex-col items-end justify-center text-[11px] text-[#667781] max-md:absolute max-md:right-4 max-md:top-4 max-md:gap-5">{item.unread ? <span className="grid min-h-5 min-w-5 place-items-center rounded-full bg-gradient-to-r from-[#8b3de8] to-[#f34ca4] px-1.5 text-[9px] font-bold text-white shadow-[0_4px_12px_rgba(139,61,232,.2)]">{item.unread}</span> : <span className="size-2 rounded-full bg-[#d9dde4] md:hidden" />}</span></button>;
}
function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode; }) { return <button type="button" onClick={onClick} className={`flex h-10 shrink-0 items-center rounded-full px-5 text-[12px] font-semibold ${active ? "border border-[#f7b4d5] bg-[#fff3f9] text-[#f34ca4]" : "bg-white/90 text-[#536471] shadow-sm"}`}>{children}</button>; }

function ChatPanel({ selected, chat, draft, setDraft, sendMessage, notice, mobileOpen, onBack, onDetails, replyingTo, onReply, onCancelReply }: { selected: Conversation; chat: ChatMessage[]; draft: string; setDraft: (value: string) => void; sendMessage: () => Promise<void>; notice: string; mobileOpen: boolean; onBack: () => void; onDetails: () => void; replyingTo: ChatMessage | null; onReply: (message: ChatMessage) => void; onCancelReply: () => void; }) {
  return <section className={`${mobileOpen ? "fixed inset-0 z-[110] flex" : "hidden"} min-h-0 min-w-0 flex-col bg-[#fbfcff] md:relative md:inset-auto md:z-auto md:flex md:bg-white`}><header className="z-10 flex h-[86px] shrink-0 items-center bg-white/90 px-4 shadow-[0_5px_20px_rgba(63,38,110,.05)] md:h-20 md:border-b md:border-[#dbdfe4] md:px-6"><button type="button" onClick={onBack} aria-label="Back to conversations" className="mr-2 grid size-9 place-items-center rounded-full text-[#667781] hover:bg-[#f0f2f5] md:hidden"><ArrowLeft size={21} /></button><span className="relative size-12 overflow-hidden rounded-full"><ProfileImage src={selected.avatar} alt="" fill sizes="48px" className="object-cover" /></span><div className="ml-3 min-w-0"><h2 className="flex items-center gap-1.5 text-[16px] font-semibold text-[#111b21]">{selected.name}<span className="max-md:hidden">, {selected.age}</span>{selected.verified ? <BadgeCheck size={17} className="shrink-0 fill-[#1d9bf0] text-[#1d9bf0] [&>path:last-child]:text-white" aria-label="Verified" /> : null}</h2><p className="mt-1 text-[12px] text-[#646a80]">{selected.profession} &nbsp;•&nbsp; {selected.city}</p></div><div className="ml-auto flex items-center gap-2 text-[#0f1419]"><button aria-label="View profile details" onClick={onDetails} className="app-icon-button max-md:hidden"><Info size={24} /></button></div></header><Link href={`/profile/${selected.partnerId}`} className="mx-4 mt-4 flex min-h-[78px] shrink-0 items-center rounded-[22px] bg-white/95 px-4 shadow-[0_8px_26px_rgba(63,38,110,.07)] md:hidden"><span className="grid size-11 place-items-center rounded-full bg-[#f3eaff] text-[#8b3de8]"><Sparkles size={21} /></span><span className="ml-3 min-w-0 flex-1"><strong className="block text-[14px] text-[#0f1419]">You matched with {selected.name}</strong><span className="mt-1 block truncate text-[11px] text-[#687684]">Start a meaningful conversation together</span></span><ChevronRight size={20} className="text-[#687684]" /></Link><div className="hidden"><ProfileImage src="/discover-banner.png" alt="" fill sizes="700px" className="object-cover opacity-60" /><span className="relative grid size-10 place-items-center rounded-full bg-[#ffe8f3] text-[#ff1682]"><ShieldCheck size={21} /></span></div><div className="min-h-0 flex-1 overflow-y-auto bg-transparent px-4 py-5 md:bg-white md:px-[5%] md:py-6"><div className="mx-auto mb-6 w-fit rounded-full bg-white/80 px-4 py-1.5 text-[11px] font-medium text-[#8a939b]">Today</div><div className="space-y-1.5">{chat.map((message) => <MessageBubble key={message.id} message={message} avatar={selected.avatar} partnerName={selected.name} replyToMessage={message.replyToId ? chat.find((item) => item.id === message.replyToId) : undefined} onReply={onReply} />)}</div></div><div className="mx-5 mb-[calc(.75rem+env(safe-area-inset-bottom))] mt-2 shrink-0 overflow-hidden rounded-[20px] border border-white bg-white shadow-[0_7px_24px_rgba(63,38,110,.10)] max-md:mx-3">{replyingTo ? <div className="mx-2 mt-2 flex items-center gap-3 rounded-[15px] border-l-[3px] border-[#f34ca4] bg-[#fff4f9] px-3 py-2.5"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-[#f34ca4]"><Reply size={16} /></span><span className="min-w-0 flex-1"><strong className="block text-[11px] font-semibold text-[#f34ca4]">Replying to {replyingTo.sender === "me" ? "your message" : selected.name}</strong><span className="mt-0.5 block truncate text-[12px] text-[#667781]">{replyingTo.text}</span></span><button type="button" onClick={onCancelReply} aria-label="Cancel reply" className="grid size-8 shrink-0 place-items-center rounded-full text-[#667781] transition hover:bg-white hover:text-[#111b21]"><X size={17} /></button></div> : null}<div className="flex min-h-14 items-center gap-2 p-1.5 pl-3"><input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void sendMessage(); }} placeholder={replyingTo ? "Type your reply..." : "Type a message..."} className="min-h-10 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-[#8696a0]" /><button onClick={() => void sendMessage()} disabled={!draft.trim()} aria-label="Send message" className={`grid size-11 shrink-0 place-items-center rounded-full text-white transition-colors ${draft.trim() ? "bg-[#8b3de8] hover:bg-[#7628d1]" : "cursor-not-allowed bg-[#b8c0c7]"}`}>{draft.trim() ? <Send size={18} fill="currentColor" /> : <Mic size={19} />}</button></div></div>{notice ? <p role="alert" className="absolute bottom-20 right-4 rounded-lg bg-red-50 px-3 py-2 text-[11px] text-red-600">{notice}</p> : null}</section>;
}
function EmptyChat() { return <section className="hidden place-items-center bg-white text-center md:grid"><div><MessageSquareIcon /><h2 className="mt-4 text-[20px] font-semibold">Meaningful conversations start here.</h2><p className="mt-2 max-w-sm text-sm leading-6 text-[#73778b]">Accept an interest or wait for someone to accept yours to begin a private conversation.</p></div></section>; }
function ProfileDetails({ conversation, onClose }: { conversation: Conversation; onClose: () => void; }) { return <aside className="fixed inset-0 z-[70] overflow-y-auto bg-white md:absolute md:inset-y-0 md:right-0 md:left-auto md:w-[340px] md:border-l md:border-[#e9edef] md:shadow-[-8px_0_24px_rgba(17,27,33,.08)]"><header className="flex h-16 items-center border-b border-[#e9edef] px-4"><button onClick={onClose} aria-label="Close profile details" className="app-icon-button"><ArrowLeft size={20} /></button><h2 className="ml-3 text-[16px] font-semibold">Profile details</h2></header><div className="px-6 py-7 text-center"><span className="relative mx-auto block size-32 overflow-hidden rounded-full"><ProfileImage src={conversation.avatar} alt={conversation.name} fill sizes="128px" className="object-cover" /></span><h3 className="mt-4 text-[20px] font-semibold">{conversation.name}, {conversation.age || "Age hidden"}</h3><p className="mt-1 text-[13px] text-[#667781]">{conversation.profession}</p><p className="mt-1 text-[13px] text-[#667781]">{conversation.city}</p><Link href={`/profile/${conversation.partnerId}`} className="mt-5 inline-flex h-10 items-center rounded-lg bg-[linear-gradient(135deg,#ff4d8d,#8b5cf6)] px-5 text-[13px] font-semibold text-white">View Profile</Link></div></aside>; }
function MessageSquareIcon() { return <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#ffeaf4] text-[#ff1682]"><SquarePen size={27} /></span>; }
function formatTime(value: string) { return new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); }
function scrollToMessage(id: string) { document.getElementById(`message-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); }
function MessageBubble({ message, avatar, partnerName, replyToMessage, onReply }: { message: ChatMessage; avatar: string; partnerName: string; replyToMessage?: ChatMessage; onReply: (message: ChatMessage) => void; }) { const mine = message.sender === "me"; const replyButton = <button type="button" onClick={() => onReply(message)} aria-label={`Reply to ${mine ? "your" : partnerName + "'s"} message`} className="grid size-8 shrink-0 place-items-center rounded-full text-[#687684] transition hover:bg-white hover:text-[#f34ca4] md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"><Reply size={16} /></button>; return <div id={`message-${message.id}`} className={`group flex items-end gap-2.5 ${mine ? "justify-end" : "justify-start"}`}>{!mine ? <span className="relative size-9 shrink-0 overflow-hidden rounded-full"><ProfileImage src={avatar} alt="" fill sizes="36px" className="object-cover" /></span> : null}{mine ? replyButton : null}<div className={`max-w-[82%] whitespace-pre-line rounded-[20px] px-4 py-3 text-[14px] leading-[1.45] shadow-[0_5px_18px_rgba(63,38,110,.06)] md:max-w-[68%] ${mine ? "bg-[#f0e5ff] text-[#0f1419]" : "bg-white text-[#111b21]"}`}>{replyToMessage ? <button type="button" onClick={() => scrollToMessage(replyToMessage.id)} className={`mb-2 block w-full overflow-hidden rounded-[12px] border-l-[3px] border-[#f34ca4] px-3 py-2 text-left ${mine ? "bg-white/55" : "bg-[#fff3f9]"}`}><strong className="block text-[11px] font-semibold text-[#f34ca4]">{replyToMessage.sender === "me" ? "You" : partnerName}</strong><span className="mt-0.5 block truncate whitespace-nowrap text-[12px] text-[#687684]">{replyToMessage.text}</span></button> : null}<p>{message.text}</p><p className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${mine ? "text-[#687684]" : "text-[#667781]"}`}>{message.time}{message.seen ? <CheckCheck size={14} className={mine ? "text-[#8b3de8]" : "text-[#1d9bf0]"} /> : null}</p></div>{!mine ? replyButton : null}</div>; }