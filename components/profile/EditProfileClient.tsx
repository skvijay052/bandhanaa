"use client";
import { ProfileImage } from "@/components/ui/ProfileImage";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Camera,
  Check,
  ChevronRight,
  Eye,
  Heart,
  MoreHorizontal,
  Search,
  Shield,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { createClient } from "@/lib/supabase/client";
import {
  editSections,
  familyLabels,
  horoscopeLabels,
  lifestyleLabels,
  preferenceLabels,
  type EditProfileData,
  type EditSection,
} from "@/data/edit-profile";
import type { DetailItem } from "@/data/my-profile";
import { profileFieldOptions } from "@/data/profile-field-options";
import { cityOptions, countries, stateOptions } from "@/data/location-options";
import { zodiacSignForDate } from "@/lib/horoscope";

const icons = {
  "Basic Details": UserRound,
  Photos: Camera,
  Lifestyle: Sparkles,
  Family: UsersRound,
  "Partner Preferences": Heart,
  Horoscope: BriefcaseBusiness,
  "Profile Visibility": Shield,
} as const;
const labelsFor = (section: EditSection) =>
  section === "Lifestyle"
    ? lifestyleLabels
    : section === "Family"
      ? familyLabels
      : section === "Partner Preferences"
        ? preferenceLabels
        : section === "Horoscope"
          ? horoscopeLabels
          : [];
function toMap(items: DetailItem[]) {
  return Object.fromEntries(items.map((item) => [item.label, item.value]));
}
function toItems(labels: string[], values: Record<string, string>) {
  return labels.map((label) => ({ label, value: values[label] ?? "" }));
}
function locationField(label: string) {
  const match = label.match(/^(Family|Preferred|Birth) (Country|State|City)$/);
  return match ? { prefix: match[1], part: match[2] as "Country" | "State" | "City" } : null;
}
function toTimeInput(value: string) {
  if (/^\d{2}:\d{2}$/.test(value)) return value;
  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return "";
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") hour += 12;
  return `${String(hour).padStart(2, "0")}:${match[2]}`;
}

export function EditProfileClient({ initial }: { initial: EditProfileData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedSection = searchParams.get("section");
  const initialSection = editSections.includes(requestedSection as EditSection)
    ? (requestedSection as EditSection)
    : "Basic Details";
  const [section, setSection] = useState<EditSection>(initialSection);
  useEffect(() => {
    if (editSections.includes(requestedSection as EditSection)) {
      setSection(requestedSection as EditSection);
    }
  }, [requestedSection]);
  const [draft, setDraft] = useState(initial);
  const [structured, setStructured] = useState<Record<string, string>>({
    ...toMap(initial.lifestyle),
    ...toMap(initial.family),
    ...toMap(initial.preferences),
    ...toMap(initial.horoscope),
  });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const setField = <K extends keyof EditProfileData>(
    key: K,
    value: EditProfileData[K],
  ) => setDraft((current) => ({ ...current, [key]: value }));
  async function save() {
    setSaving(true);
    setNotice("");
    const supabase = createClient();
    const completion = Math.min(
      100,
      Math.round(
        ([
          draft.displayName,
          draft.birthDate,
          draft.gender,
          draft.maritalStatus,
          draft.religion,
          draft.motherTongue,
          draft.height,
          draft.city,
          draft.state,
          draft.country,
          draft.education,
          draft.profession,
          draft.about,
        ].filter(Boolean).length /
          13) *
          85,
      ) + (draft.photos.length ? 15 : 0),
    );
    const update = {
      display_name: draft.displayName,
      birth_date: draft.birthDate || null,
      gender: draft.gender || null,
      marital_status: draft.maritalStatus || null,
      religion: draft.religion || null,
      mother_tongue: draft.motherTongue || null,
      height: draft.height || null,
      weight: draft.weight || null,
      city: draft.city || null,
      state: draft.state || null,
      country: draft.country || null,
      education: draft.education || null,
      profession: draft.profession || null,
      company: draft.company || null,
      bio: draft.about || null,
      lifestyle: toItems(lifestyleLabels, structured),
      family: toItems(familyLabels, structured),
      partner_preferences: toItems(preferenceLabels, structured),
      horoscope: toItems(horoscopeLabels, structured),
      profile_visibility: draft.visibility,
      visibility_details: draft.visibilityDetails,
      profile_completion: completion,
    };
    const { error } = await supabase
      .from("profiles")
      .update(update)
      .eq("id", draft.id);
    setSaving(false);
    if (error) {
      setNotice(error.message);
      return;
    }
    setDraft((current) => ({ ...current, completion }));
    setNotice("Changes saved.");
    const index = editSections.indexOf(section);
    if (index < editSections.length - 1) setSection(editSections[index + 1]);
    router.refresh();
  }
  return (
    <main className="fixed inset-0 overflow-hidden bg-[var(--app-bg)]">
      <div className="app-shell edit-profile-shell !h-full">
        <AppSidebar active="Profile" />
        <div className="grid h-full min-h-0 min-w-0 flex-1 md:grid-cols-[340px_minmax(0,1fr)]">
          <DesktopSectionNav active={section} onChange={setSection} />
          <div className="h-full min-h-0 overflow-y-auto px-6 pb-10 max-md:px-3">
            <header className="mx-auto flex max-w-[780px] items-start py-6 md:py-8">
              <button
                onClick={() => router.push("/my-profile")}
                className="mr-4 grid size-9 shrink-0 place-items-center rounded-full transition-colors hover:bg-[#f2f3f5]"
                aria-label="Back to profile"
              >
                <ArrowLeft size={24} strokeWidth={2} />
              </button>
              <div>
                <h1 className="text-[24px] font-bold max-md:text-[17px]">
                  Edit profile
                </h1>
                <p className="mt-1 text-[12px] text-[#596077] max-md:hidden">
                  Update your details and preferences.
                </p>
              </div>
              <span className="ml-auto flex items-center gap-2 rounded-full bg-[#dcf7e9] px-4 py-2 text-[11px] font-semibold text-[#246747]">
                <Check size={12} />
                Profile is {draft.completion}% complete
              </span>
            </header>
            <div className="mx-auto max-w-[780px]">
              <section className="mb-8 flex items-center rounded-2xl bg-[#f2f3f5] p-5 max-md:p-4">
                <span className="relative size-16 shrink-0 overflow-hidden rounded-full"><ProfileImage src={draft.avatar} alt={draft.displayName} fill sizes="64px" className="object-cover" /></span>
                <div className="ml-4 min-w-0"><strong className="block truncate text-[16px]">{draft.displayName}</strong><span className="mt-1 block text-[13px] text-[var(--text-secondary)]">Profile is {draft.completion}% complete</span></div>
                <button onClick={() => setSection("Photos")} className="ml-auto h-10 rounded-lg bg-[#1d9bf0] px-5 text-[14px] font-semibold text-white hover:bg-[#1689df]">Change photo</button>
              </section>
              <MobileSectionNav active={section} onChange={setSection} />
              <section className="py-2 md:py-3">
                <SectionContent
                  section={section}
                  draft={draft}
                  setField={setField}
                  structured={structured}
                  setStructured={setStructured}
                  setNotice={setNotice}
                />
                {notice ? (
                  <p
                    role="status"
                    className={`mt-4 text-[11px] ${notice === "Changes saved." ? "text-emerald-600" : notice.startsWith("Horoscope generated:") ? "text-[#1d9bf0]" : "text-red-600"}`}
                  >
                    {notice}
                  </p>
                ) : null}
                <div className="mt-6 flex justify-end gap-3 max-md:grid max-md:grid-cols-1">
                  <button
                    onClick={() => router.push("/my-profile")}
                    className="h-10 rounded-lg bg-[#efefef] px-5 text-[14px] font-semibold text-[#0f1419] hover:bg-[#e5e5e5] max-md:order-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => void save()}
                    disabled={saving}
                    className="h-10 rounded-lg bg-[#1d9bf0] px-5 text-[14px] font-semibold text-white hover:bg-[#1689df] disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Save & Continue"}
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function DesktopSectionNav({
  active,
  onChange,
}: {
  active: EditSection;
  onChange: (x: EditSection) => void;
}) {
  return (
    <aside className="hidden h-full min-h-0 overflow-y-auto border-r border-[var(--border)] bg-white px-6 py-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:block">
      <h1 className="px-2 text-[24px] font-bold tracking-[-0.02em]">Settings</h1>
      <label className="mt-7 flex h-12 items-center gap-3 rounded-full bg-[#f2f3f5] px-4 text-[var(--text-secondary)]">
        <Search size={19} aria-hidden="true" />
        <input
          type="search"
          aria-label="Search settings"
          placeholder="Search"
          className="min-w-0 flex-1 bg-transparent text-[15px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
        />
      </label>
      <p className="mb-2 mt-9 px-3 text-[13px] font-medium text-[var(--text-secondary)]">
        Profile settings
      </p>
      <nav aria-label="Profile settings" className="space-y-1">
        {editSections.map((label) => {
          const Icon = icons[label];
          return (
            <button
              key={label}
              onClick={() => onChange(label)}
              aria-current={active === label ? "page" : undefined}
              className={`flex min-h-[56px] w-full items-center gap-[18px] rounded-xl px-4 text-left text-[16px] transition-colors duration-150 hover:bg-[#f7f9f9] ${active === label ? "bg-[#f2f3f5] font-semibold text-[#0f1419]" : "font-normal text-[#0f1419]"}`}
            >
              <Icon size={23} strokeWidth={active === label ? 2.4 : 1.8} />
              {label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
function MobileSectionNav({
  active,
  onChange,
}: {
  active: EditSection;
  onChange: (x: EditSection) => void;
}) {
  return (
    <nav className="mb-4 flex overflow-x-auto border-b border-[#eeeef2] md:hidden [scrollbar-width:none]">
      {editSections.slice(0, 6).map((label) => {
        const Icon = icons[label];
        return (
          <button
            key={label}
            onClick={() => onChange(label)}
            className={`relative flex min-w-[74px] flex-col items-center gap-1 pb-3 text-[8px] ${active === label ? "text-[#1d9bf0]" : ""}`}
          >
            <span className="grid size-9 place-items-center rounded-full border border-[#e4e6ed]">
              <Icon size={15} />
            </span>
            {label
              .replace(" Details", "")
              .replace("Partner Preferences", "Partner Pref.")}
            {active === label ? (
              <span className="absolute bottom-0 h-0.5 w-10 bg-[#1d9bf0]" />
            ) : null}
          </button>
        );
      })}
      <button
        onClick={() => onChange("Profile Visibility")}
        className="flex min-w-[65px] flex-col items-center gap-1 pb-3 text-[8px]"
      >
        <span className="grid size-9 place-items-center rounded-full border">
          <MoreHorizontal size={15} />
        </span>
        More
      </button>
    </nav>
  );
}

function SectionContent({
  section,
  draft,
  setField,
  structured,
  setStructured,
  setNotice,
}: {
  section: EditSection;
  draft: EditProfileData;
  setField: <K extends keyof EditProfileData>(
    key: K,
    value: EditProfileData[K],
  ) => void;
  structured: Record<string, string>;
  setStructured: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setNotice: React.Dispatch<React.SetStateAction<string>>;
}) {
  if (section === "Basic Details")
    return <BasicForm draft={draft} setField={setField} />;
  if (section === "Photos") return <PhotosEditor draft={draft} />;
  if (section === "Profile Visibility")
    return <VisibilityEditor draft={draft} setField={setField} />;
  const labels = labelsFor(section);
  return (
    <div>
      <h2 className="text-[17px] font-bold">{section}</h2>
      <p className="mt-1 text-[11px] text-[#596077]">
        {section === "Family"
          ? "Tell us about your family."
          : section === "Partner Preferences"
            ? "Tell us about your ideal partner."
            : section === "Horoscope"
              ? "Your horoscope helps matches understand your personality better."
              : "Help others know you better."}
      </p>
      {section === "Horoscope" ? (
        <div className="mt-4 rounded-xl border border-[#d7e8f5] bg-[#f5fbff] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[13px] font-semibold text-[#0f1419]">Generate your Zodiac sign</p>
              <p className="mt-1 text-[11px] text-[#536471]">Uses your date of birth. Nakshatra, Rashi and Lagna remain editable because they require accurate birth time and place.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const birthDate = structured["Date of Birth"] || draft.birthDate;
                const zodiac = zodiacSignForDate(birthDate);
                if (!zodiac) {
                  setNotice("Add a valid date of birth before generating your horoscope.");
                  return;
                }
                setField("birthDate", birthDate);
                setStructured((current) => ({
                  ...current,
                  "Date of Birth": birthDate,
                  "Zodiac Sign": zodiac,
                }));
                setNotice(`Horoscope generated: ${zodiac}. Save changes to display it on your profile.`);
              }}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-[#1d9bf0] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#1689df]"
            >
              <Sparkles size={16} />
              Generate Horoscope
            </button>
          </div>
        </div>
      ) : null}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {labels.map((label) => {
          const location = locationField(label);
          if (label.startsWith("About")) return (
            <label key={label} className="form-label md:col-span-2">
              {label}
              <textarea
                value={structured[label] ?? ""}
                maxLength={500}
                onChange={(e) =>
                  setStructured((current) => ({
                    ...current,
                    [label]: e.target.value,
                  }))
                }
                className="form-textarea"
              />
            </label>
          );
          if (label === "Date of Birth") return (
            <label key={label} className="form-label">
              {label}
              <input type="date" max={new Date().toISOString().slice(0, 10)} value={structured[label] || draft.birthDate || ""} onChange={(e) => { setField("birthDate", e.target.value); setStructured((current) => ({ ...current, [label]: e.target.value })); }} className="form-control cursor-pointer [color-scheme:light]" />
            </label>
          );
          if (label === "Time of Birth") return (
            <label key={label} className="form-label">
              {label}
              <input type="time" step={300} value={toTimeInput(structured[label] ?? "")} onChange={(e) => setStructured((current) => ({ ...current, [label]: e.target.value }))} className="form-control cursor-pointer [color-scheme:light]" />
            </label>
          );
          if (location) {
            const countryKey = `${location.prefix} Country`;
            const stateKey = `${location.prefix} State`;
            const selectedCountry = structured[countryKey] ?? "";
            const selectedState = structured[stateKey] ?? "";
            const locationOptions = location.part === "Country"
              ? countries
              : location.part === "State"
                ? stateOptions(selectedCountry)
                : cityOptions(selectedState);
            return <SearchableSelect
              key={label}
              label={location.part}
              value={structured[label] ?? ""}
              options={locationOptions}
              allowCustom={location.part !== "Country"}
              onChange={(value) => setStructured((current) => ({
                ...current,
                [label]: value,
                ...(location.part === "Country" ? { [`${location.prefix} State`]: "", [`${location.prefix} City`]: "" } : {}),
                ...(location.part === "State" ? { [`${location.prefix} City`]: "" } : {}),
              }))}
            />;
          }
          return <SearchableSelect
            key={label}
            label={label}
            value={structured[label] ?? ""}
            options={profileFieldOptions(label, structured.Religion)}
            onChange={(value) => setStructured((current) => ({
              ...current,
              [label]: value,
              ...(label === "Religion" ? { "Caste (Optional)": "" } : {}),
            }))}
          />;
        })}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (x: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="form-label">
      {label}
      {required ? <span className="text-[#ff1682]"> *</span> : null}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-control"
      />
    </label>
  );
}
function BasicForm({
  draft,
  setField,
}: {
  draft: EditProfileData;
  setField: <K extends keyof EditProfileData>(
    key: K,
    value: EditProfileData[K],
  ) => void;
}) {
  return (
    <div>
      <div className="flex justify-between">
        <h2 className="text-[17px] font-bold">Basic Details</h2>
        <span className="text-[10px] text-[#ff1682]">* Required</span>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Field
          label="Full Name"
          value={draft.displayName}
          onChange={(x) => setField("displayName", x)}
          required
        />
        <Field
          label="Date of Birth"
          type="date"
          value={draft.birthDate}
          onChange={(x) => setField("birthDate", x)}
          required
        />
        <SearchableSelect label="Gender" value={draft.gender} options={profileFieldOptions("Gender")} onChange={(x) => setField("gender", x)} required />
        <SearchableSelect label="Marital Status" value={draft.maritalStatus} options={profileFieldOptions("Marital Status")} onChange={(x) => setField("maritalStatus", x)} required />
        <SearchableSelect label="Religion" value={draft.religion} options={profileFieldOptions("Religion")} onChange={(x) => setField("religion", x)} required />
        <SearchableSelect label="Mother Tongue" value={draft.motherTongue} options={profileFieldOptions("Mother Tongue")} onChange={(x) => setField("motherTongue", x)} required />
        <SearchableSelect label="Height" value={draft.height} options={profileFieldOptions("Height")} onChange={(x) => setField("height", x)} required />
        <SearchableSelect label="Weight" value={draft.weight} options={profileFieldOptions("Weight")} onChange={(x) => setField("weight", x)} />
        <SearchableSelect label="Country" value={draft.country} options={countries} onChange={(value) => { setField("country", value); setField("state", ""); setField("city", ""); }} required />
        <SearchableSelect label="State" value={draft.state} options={stateOptions(draft.country)} onChange={(value) => { setField("state", value); setField("city", ""); }} required allowCustom />
        <SearchableSelect label="City" value={draft.city} options={cityOptions(draft.state)} onChange={(x) => setField("city", x)} required allowCustom />
        <SearchableSelect label="Education" value={draft.education} options={profileFieldOptions("Education")} onChange={(x) => setField("education", x)} required />
        <SearchableSelect label="Profession" value={draft.profession} options={profileFieldOptions("Profession")} onChange={(x) => setField("profession", x)} required />
        <Field
          label="Company"
          value={draft.company}
          onChange={(x) => setField("company", x)}
        />
        <label className="form-label md:col-span-2">
          About Me
          <textarea
            value={draft.about}
            maxLength={500}
            onChange={(e) => setField("about", e.target.value)}
            className="form-textarea"
          />
        </label>
      </div>
    </div>
  );
}
function PhotosEditor({ draft }: { draft: EditProfileData }) {
  return (
    <div>
      <h2 className="text-[17px] font-bold">Photos</h2>
      <p className="mt-1 text-[11px] text-[#596077]">
        Add clear, recent photos to get better matches.
      </p>
      <div className="mt-5 grid grid-cols-3 gap-3 md:grid-cols-6">
        {draft.photos.map((photo, i) => (
          <span
            key={`${photo}-${i}`}
            className="relative aspect-square overflow-hidden rounded-lg"
          >
            <ProfileImage
              src={photo}
              alt={`Profile photo ${i + 1}`}
              fill
              sizes="120px"
              className="object-cover"
            />
          </span>
        ))}
        <button
          onClick={() => location.assign("/my-profile")}
          className="flex aspect-square flex-col items-center justify-center rounded-lg border border-dashed border-[#bfc3d0] text-[10px]"
        >
          <Camera size={20} />
          <span className="mt-2">Add Photo</span>
        </button>
      </div>
      <p className="mt-4 text-[10px] text-[#596077]">
        Photo cropping and uploads are available by clicking your photo on My
        Profile.
      </p>
    </div>
  );
}
function VisibilityEditor({
  draft,
  setField,
}: {
  draft: EditProfileData;
  setField: <K extends keyof EditProfileData>(
    key: K,
    value: EditProfileData[K],
  ) => void;
}) {
  const choices: Array<{
    value: EditProfileData["visibility"];
    label: string;
    description: string;
  }> = [
    {
      value: "everyone",
      label: "Public",
      description: "Anyone on Bandhanaa can see your profile.",
    },
    {
      value: "connections",
      label: "Limited",
      description: "Only profiles matching your preferences can see you.",
    },
    {
      value: "private",
      label: "Private",
      description: "Only people you show interest in can see you.",
    },
  ];
  return (
    <div className="max-w-[760px]">
      <h2 className="text-[22px] font-bold tracking-[-0.01em]">Profile Visibility</h2>
      <p className="mt-1 text-[14px] font-normal text-[var(--text-secondary)]">
        Control who can see your profile and what information is visible to
        others.
      </p>
      <section className="mt-9">
        <h3 className="text-[16px] font-semibold">Who can see your profile</h3>
        <div className="mt-4 space-y-1">
        {choices.map((choice) => (
          <label
            key={choice.value}
            className="flex min-h-[62px] cursor-pointer items-center rounded-lg px-1 transition-colors hover:bg-[#f7f9f9]"
          >
            <input
              type="radio"
              name="visibility"
              checked={draft.visibility === choice.value}
              onChange={() => setField("visibility", choice.value)}
              className="peer sr-only"
            />
            <span className={`grid size-[30px] shrink-0 place-items-center rounded-full border bg-white ${draft.visibility === choice.value ? "border-[#0f1419]" : "border-[#9aa0a6]"}`}>
              <span className={`size-[18px] rounded-full ${draft.visibility === choice.value ? "bg-[#0f1419]" : "bg-transparent"}`} />
            </span>
            <span className="ml-4">
              <strong className="block text-[15px] font-normal">{choice.label}</strong>
              <span className="mt-0.5 block text-[12px] font-normal text-[var(--text-secondary)]">
                {choice.description}
              </span>
            </span>
          </label>
        ))}
        </div>
      </section>

      <div className="my-8 h-px bg-[var(--border)]" />

      <section>
        <h3 className="text-[16px] font-semibold">Information visible to others</h3>
        <p className="mt-1 text-[13px] font-normal text-[var(--text-secondary)]">
          Choose which profile details other members can see.
        </p>
        <div className="mt-4 divide-y divide-[var(--border)]">
        {Object.entries(draft.visibilityDetails).map(([label, enabled]) => (
          <div
            key={label}
            className="flex min-h-[72px] items-center px-1"
          >
            <span>
              <strong className="block text-[15px] font-normal">{label}</strong>
              <span className="mt-0.5 block text-[12px] font-normal text-[var(--text-secondary)]">
                Show this information on your profile
              </span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              aria-label={`Show ${label}`}
              onClick={() =>
                setField("visibilityDetails", {
                  ...draft.visibilityDetails,
                  [label]: !enabled,
                })
              }
              className={`relative ml-auto h-[30px] w-[50px] shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d9bf0] ${enabled ? "bg-[#0f1419]" : "bg-[#8b949e]"}`}
            >
              <span className={`absolute left-0 top-[3px] size-6 rounded-full bg-white transition-transform ${enabled ? "translate-x-[23px]" : "translate-x-[3px]"}`} />
            </button>
          </div>
        ))}
        </div>
      </section>
      </div>
  );
}
