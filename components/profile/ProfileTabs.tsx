import {
  Camera,
  Heart,
  Sparkles,
  UsersRound,
} from "lucide-react";
const desktop = [
  "About",
  "Photos",
  "Lifestyle",
  "Family",
  "Partner Preferences",
  "Horoscope",
  "Verification",
];
const sectionId = (label: string) => `profile-${label.toLowerCase().replaceAll(" ", "-")}`;
export function ProfileTabs({
  active,
  onChange,
  mobile = false,
}: {
  active: string;
  onChange: (x: string) => void;
  mobile?: boolean;
}) {
  const selectTab = (label: string) => {
    onChange(label);
    document.getElementById(`${sectionId(label)}${mobile ? "-mobile" : ""}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  if (mobile) {
    const tabs = [
      [Heart, "About"],
      [Camera, "Photos"],
      [Sparkles, "Lifestyle"],
      [UsersRound, "Family"],
      [Sparkles, "Horoscope"],
    ] as const;
    return (
      <nav
        aria-label="Profile sections"
        className="grid grid-cols-5 border-b border-[#e6edf2] bg-white px-1"
      >
        {tabs.map(([Icon, label]) => (
          <button
            key={label}
            onClick={() => selectTab(label)}
            className={`relative flex h-[68px] flex-col items-center justify-center gap-1 text-[12px] ${active === label ? "text-[#1d9bf0]" : "text-[#30354c]"}`}
          >
            <span
              className={`grid size-8 place-items-center rounded-full ${active === label ? "bg-[#e8f5fe]" : ""}`}
            >
              <Icon size={15} />
            </span>
            {label}
            {active === label ? (
              <span className="absolute inset-x-3 bottom-0 h-0.5 bg-[#1d9bf0]" />
            ) : null}
          </button>
        ))}
      </nav>
    );
  }
  return (
    <nav
      aria-label="Profile sections"
      className="flex h-[54px] items-center justify-between border-b border-[#e6edf2] bg-white px-3"
    >
      {desktop.map((label) => (
        <button
          key={label}
          onClick={() => selectTab(label)}
          className={`relative h-full px-4 text-[14px] font-semibold transition-colors ${active === label ? "text-[#1d9bf0] after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-[#1d9bf0]" : "text-[#363b52] hover:text-[#1d9bf0]"}`}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
