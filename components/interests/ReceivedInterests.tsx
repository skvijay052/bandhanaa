import type { InterestProfile } from "@/data/interests";
import { ReceivedInterestCard } from "./ReceivedInterestCard";

export function ReceivedInterests({
  profiles,
  onRespond,
}: {
  profiles: InterestProfile[];
  onRespond: (id: string) => void;
}) {
  return (
    <section>
      <SectionHeader
        title="Received Interests"
        subtitle="People who have shown interest in you."
      />
      <div className="mt-4 grid grid-cols-4 gap-5 max-md:mt-2 max-md:block max-md:divide-y max-md:divide-[#eeeef2]">
        {profiles.map((profile) => (
          <ReceivedInterestCard
            key={profile.id}
            profile={profile}
            onRespond={() => onRespond(profile.id)}
          />
        ))}
      </div>
    </section>
  );
}

export function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h2 className="text-[18px] font-bold max-md:text-[14px]">{title}</h2>
        <p className="mt-1 text-xs text-[#656a80] max-md:text-[10px]">
          {subtitle}
        </p>
      </div>
      <button className="text-xs font-semibold text-[#ff1682] max-md:text-[10px]">
        View all <span aria-hidden>→</span>
      </button>
    </div>
  );
}
