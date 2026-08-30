import {
  BriefcaseBusiness,
  CalendarDays,
  GraduationCap,
  Languages,
  MapPin,
  Ruler,
  ShieldCheck,
  UserRound,
  UsersRound,
  Weight,
} from "lucide-react";
import type { MyProfileData } from "@/data/my-profile";
export const details = (p: MyProfileData) =>
  [
    [CalendarDays, "Age", p.age ? `${p.age} years` : "Not added"],
    [CalendarDays, "Birth Date", p.birthDate],
    [Ruler, "Height", p.height],
    [GraduationCap, "Education", p.education],
    [BriefcaseBusiness, "Profession", p.profession],
    [BriefcaseBusiness, "Company", p.company],
    [MapPin, "Location", [p.city, p.state, p.country].filter(Boolean).join(", ")],
    [UserRound, "Gender", p.gender],
    [Weight, "Weight", p.weight],
    [ShieldCheck, "Religion", p.religion],
    [Languages, "Mother Tongue", p.motherTongue],
    [UsersRound, "Marital Status", p.maritalStatus],
    [ShieldCheck, "Profile Compatibility", `${p.compatibility}%`],
    [ShieldCheck, "Discoverable", p.discoverable ? "Yes" : "No"],
  ] as const;
export function AboutMeSection({
  profile,
  mobile = false,
  expanded = false,
  onExpand,
}: {
  profile: MyProfileData;
  mobile?: boolean;
  expanded?: boolean;
  onExpand?: () => void;
}) {
  const visible = details(profile);
  return (
    <section>
      <h2 className="text-[18px] font-bold">About Me</h2>
      <p
        className={`mt-3 max-w-[680px] text-[14px] leading-6 text-[#30354c] ${mobile && !expanded ? "line-clamp-4" : ""}`}
      >
        {profile.about}
      </p>
      {mobile ? (
        <button
          onClick={onExpand}
          className="mt-2 text-[13px] font-semibold text-[#1d9bf0]"
        >
          {expanded ? "View Less" : "View More"}
        </button>
      ) : null}
      <div
        className={`${mobile ? "mt-5 space-y-4 border-t border-[#e6edf2] pt-5" : "mt-6 grid grid-cols-2 gap-x-14 gap-y-6"}`}
      >
        {visible.map(([Icon, label, value]) => (
          <div
            key={label}
            className={`${mobile ? "grid grid-cols-[20px_1fr_1.25fr]" : "flex gap-3"} items-start`}
          >
            <Icon size={17} className="mt-0.5 text-[#596579]" />
            <div className={mobile ? "contents" : ""}>
              <p className="text-[13px] text-[#71768a]">{label}</p>
              <p
                className={`${mobile ? "" : "mt-1"} text-[14px] font-semibold`}
              >
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
