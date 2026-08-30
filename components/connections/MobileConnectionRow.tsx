import { ProfileImage } from "@/components/ui/ProfileImage";
import { MapPin, MessageSquare, Send } from "lucide-react";
import type { ConnectionProfile } from "@/data/connections";
import { Verified } from "./ActiveConnectionCard";
export function MobileConnectionRow({
  profile,
  pending = false,
  sent = false,
  onSayHello,
  actionLabel = "Accept",
}: {
  profile: ConnectionProfile;
  pending?: boolean;
  sent?: boolean;
  onSayHello?: () => void;
  actionLabel?: string;
}) {
  return (
    <article className="flex min-h-[82px] items-center py-2.5">
      <span className="relative size-[50px] shrink-0">
        <ProfileImage
          src={profile.image}
          alt={`${profile.name}'s profile`}
          fill
          sizes="50px"
          className="rounded-full object-cover"
        />
        {profile.online ? (
          <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-[#49c98b]" />
        ) : null}
      </span>
      <div className="ml-3 min-w-0 flex-1">
        <h3 className="flex items-center gap-1.5 text-[12px] font-bold">
          {profile.name}, {profile.age}
          {profile.verified ? <Verified /> : null}
        </h3>
        <p className="mt-1 text-[10px] text-[#596077]">{profile.profession}</p>
        <p className="mt-1 flex items-center gap-1 text-[9px] text-[#596077]">
          <MapPin size={10} />
          {profile.location}
        </p>
      </div>
      {pending ? (
        <button
          onClick={onSayHello}
          disabled={sent}
          className="flex h-8 shrink-0 items-center gap-2 rounded-lg border border-[#ff8dc0] px-3 text-[10px] font-semibold text-[#ff1682]"
        >
          <Send size={13} />
          {sent && profile.requestDirection === "received" ? "Accepting…" : actionLabel}
        </button>
      ) : (
        <button
          aria-label={`Message ${profile.name}`}
          className="grid size-10 shrink-0 place-items-center rounded-full border border-[#ffd2e6] text-[#ff1682]"
        >
          <MessageSquare size={17} />
        </button>
      )}
    </article>
  );
}
