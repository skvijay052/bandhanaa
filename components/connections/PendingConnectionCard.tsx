import { ProfileImage } from "@/components/ui/ProfileImage";
import { Clock3, MapPin, MoreVertical, Send } from "lucide-react";
import type { ConnectionProfile } from "@/data/connections";
import { Verified } from "./ActiveConnectionCard";
export function PendingConnectionCard({
  profile,
  sent,
  onSayHello,
  actionLabel,
}: {
  profile: ConnectionProfile;
  sent: boolean;
  onSayHello: () => void;
  actionLabel: string;
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-[#ececf0] bg-white shadow-[0_2px_10px_rgba(16,24,40,.04)]">
      <div className="relative h-[100px]">
        <ProfileImage
          src={profile.image}
          alt={`${profile.name}'s profile`}
          fill
          sizes="(max-width: 1200px) 25vw, 220px"
          className="object-cover"
        />
        <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] text-[#f59e0b]">
          <Clock3 size={11} />
          Pending
        </span>
        <button
          aria-label={`More options for ${profile.name}`}
          className="absolute bottom-2 right-2 grid size-6 place-items-center rounded-full bg-white/85"
        >
          <MoreVertical size={15} />
        </button>
      </div>
      <div className="p-3">
        <h3 className="flex items-center gap-1.5 text-[14px] font-bold">
          {profile.name}, {profile.age}
          {profile.verified ? <Verified /> : null}
        </h3>
        <p className="mt-1.5 text-[10px] text-[#596077]">
          {profile.profession}
        </p>
        <p className="mt-1.5 flex items-center gap-1 text-[10px] text-[#596077]">
          <MapPin size={11} />
          {profile.location}
        </p>
        <button
          onClick={onSayHello}
          disabled={sent}
          className="mt-3 flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-[#1d9bf0] text-[10px] font-semibold text-white hover:bg-[#1689df] disabled:opacity-70"
        >
          <Send size={13} />
          {sent && profile.requestDirection === "received" ? "Accepting…" : actionLabel}
        </button>
      </div>
    </article>
  );
}
