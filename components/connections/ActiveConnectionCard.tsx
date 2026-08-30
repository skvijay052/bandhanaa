import { ProfileImage } from "@/components/ui/ProfileImage";
import {
  Check,
  MapPin,
  MessageSquare,
  MoreVertical,
  Phone,
} from "lucide-react";
import type { ConnectionProfile } from "@/data/connections";
function Verified() {
  return (
    <span className="grid size-3.5 place-items-center rounded-full bg-[#9a43ee] text-[8px] text-white">
      ✓
    </span>
  );
}
export function ActiveConnectionCard({
  profile,
}: {
  profile: ConnectionProfile;
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-[#ececf0] bg-white shadow-[0_2px_10px_rgba(16,24,40,.04)]">
      <div className="relative h-[140px]">
        <ProfileImage
          src={profile.image}
          alt={`${profile.name}'s profile`}
          fill
          sizes="(max-width: 1200px) 25vw, 220px"
          className="object-cover"
        />
        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-[#dcf7e9] px-2 py-1 text-[10px] text-[#176b49]">
          <Check size={11} />
          Active
        </span>
        <button
          aria-label={`More options for ${profile.name}`}
          className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-white/90"
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
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button className="flex h-8 items-center justify-center gap-2 rounded-lg border border-[#ff9bc8] text-[10px] font-semibold">
            <MessageSquare size={14} className="text-[#d6228d]" />
            Message
          </button>
          <button className="flex h-8 items-center justify-center gap-2 rounded-lg border border-[#ffb2d5] text-[10px] font-semibold">
            <Phone size={14} className="text-[#7a46f5]" />
            Call
          </button>
        </div>
      </div>
    </article>
  );
}
export { Verified };
