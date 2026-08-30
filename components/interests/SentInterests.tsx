import type { InterestProfile } from "@/data/interests";
import { SectionHeader } from "./ReceivedInterests";
import { SentInterestCard } from "./SentInterestCard";

export function SentInterests({ profiles }: { profiles: InterestProfile[] }) {
  return (
    <section>
      <SectionHeader
        title="Interests You Sent"
        subtitle="People you've shown interest in."
      />
      <div className="mt-4 grid grid-cols-4 gap-5 max-md:mt-2 max-md:block max-md:divide-y max-md:divide-[#eeeef2]">
        {profiles.map((profile) => (
          <SentInterestCard key={profile.id} profile={profile} />
        ))}
      </div>
    </section>
  );
}
