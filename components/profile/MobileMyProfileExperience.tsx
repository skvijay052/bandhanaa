"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, BadgeCheck, Bookmark, BriefcaseBusiness, CalendarDays, Camera, Check, GraduationCap, Heart, Languages, MapPin, MessageCircle, MoreVertical, Pencil, Ruler, Settings, Sparkles, Trash2, UserRound, Users, Weight } from "lucide-react";
import type { MyProfileData } from "@/data/my-profile";
import { ProfileImage } from "@/components/ui/ProfileImage";
import { Brand } from "@/components/auth/Brand";
import { DetailCard } from "./ProfileDetailCards";

export function MobileMyProfileExperience({
  profile,
  stats,
  onEdit,
  onAvatar,
  onAddPhoto,
  onSetProfilePicture,
  onDeletePhoto,
}: {
  profile: MyProfileData;
  stats: { interested: number; sent: number; shortlisted: number };
  onEdit: () => void;
  onAvatar: () => void;
  onAddPhoto: () => void;
  onSetProfilePicture: (photo: string) => Promise<void>;
  onDeletePhoto: (photo: string) => Promise<void>;
}) {
  const [photoMenu, setPhotoMenu] = useState<string | null>(null);
  const location = [profile.city, profile.state, profile.country].filter((v) => v && v !== "Not added").join(", ") || "Location not added";
  const details = [[CalendarDays, "Age", profile.age ? `${profile.age} years` : "Not added"], [CalendarDays, "Date of Birth", profile.birthDate], [UserRound, "Gender", profile.gender], [Ruler, "Height", profile.height], [Weight, "Weight", profile.weight], [Sparkles, "Religion", profile.religion], [Languages, "Mother Tongue", profile.motherTongue], [Heart, "Marital Status", profile.maritalStatus], [MapPin, "Location", location], [GraduationCap, "Education", profile.education], [BriefcaseBusiness, "Profession", profile.profession], [BriefcaseBusiness, "Company", profile.company]] as const;
  const chips = profile.lifestyle.slice(0, 4).map((item) => item.value).filter((v) => v && v !== "Not added");
  const photos = Array.from(new Set([profile.avatar, ...profile.photos].filter(Boolean))).slice(0, 6);

  async function setAsProfile(photo: string) {
    setPhotoMenu(null);
    await onSetProfilePicture(photo);
  }

  async function removePhoto(photo: string) {
    setPhotoMenu(null);
    await onDeletePhoto(photo);
  }

  return <div className="my-profile-mobile md:hidden">
    <header className="my-profile-mobile__header">
      <Link href="/discover" aria-label="Back"><ArrowLeft /></Link>
      <div className="flex justify-center" aria-label="Bandhanaa"><Brand compact /></div>
      <Link href="/settings" aria-label="Settings"><Settings /></Link>
    </header>
    <section className="my-profile-mobile__hero">
      <button className="my-profile-mobile__avatar" onClick={onAvatar} aria-label="Change profile photo"><ProfileImage src={profile.avatar} alt={profile.name} fill priority sizes="112px" className="object-cover" /><span><Camera /></span></button>
      <div className="min-w-0 flex-1"><h2>{profile.name}{profile.verified && <BadgeCheck />}</h2><p className="my-profile-mobile__role">{profile.age || "—"} · {profile.profession}</p><p className="my-profile-mobile__location"><MapPin />{location}</p><p className="my-profile-mobile__complete"><i />Profile is <b>{profile.completion}%</b> complete</p><div className="my-profile-mobile__progress" style={{ width: "88%", height: 8, marginTop: 6 }}><span style={{ width: `${profile.completion}%` }} /><b>{profile.completion}%</b></div></div>
    </section>
    
    <section className="my-profile-mobile__stats">{([[Users, profile.photos.length, "Profile Views"], [Heart, stats.interested, "Interested In Me"], [MessageCircle, stats.sent, "Requests Sent"], [Bookmark, stats.shortlisted, "Shortlisted"]] as const).map(([Icon, value, label]) => <div key={label}><Icon /><strong>{value}</strong><span>{label}</span></div>)}</section>
    <section className="my-profile-mobile__card my-profile-mobile__info-card">
      <div className="my-profile-mobile__section-title"><h3>About Me</h3><button onClick={onEdit}><Pencil /> Edit</button></div><p className="my-profile-mobile__about">{profile.about}</p>{chips.length > 0 && <div className="my-profile-mobile__chips">{chips.map((chip) => <span key={chip}>{chip}</span>)}</div>}<div className="my-profile-mobile__divider" />
      <div className="my-profile-mobile__section-title"><h3>Basic Details</h3><button onClick={onEdit}><Pencil /> Edit</button></div><div className="my-profile-mobile__details">{details.map(([Icon, label, value]) => <div key={label}><span><Icon /></span><p><small>{label}</small><strong>{value || "Not added"}</strong></p></div>)}</div>
    </section>
    <section className={`my-profile-mobile__card my-profile-mobile__photos relative !overflow-visible ${photoMenu ? "z-[80]" : "z-10"}`}>
      <div className="my-profile-mobile__section-title"><h3>My Photos</h3><button onClick={onEdit}><Pencil /> Edit</button></div>
      <div className="my-profile-mobile__photo-row !overflow-visible">
        {photos.map((photo, index) => {
          const isProfile = profile.avatar === photo;
          const open = photoMenu === photo;
          const menuPosition = index === 0 ? "left-0" : "right-0";
          return <div key={photo} className={`${isProfile ? "is-primary" : ""} relative !overflow-visible ${open ? "z-[90]" : "z-10"}`}>
            <span className="absolute inset-0 overflow-hidden rounded-[inherit] bg-[#eee]"><ProfileImage src={photo} alt={`${profile.name} photo ${index + 1}`} fill sizes="90px" className="object-cover" /></span>
            <button
              type="button"
              onClick={() => setPhotoMenu(open ? null : photo)}
              aria-label={`Photo options for photo ${index + 1}`}
              aria-expanded={open}
              className="absolute right-1.5 top-1.5 z-20 grid size-6 place-items-center rounded-full bg-black/55 text-white shadow-sm backdrop-blur-sm"
            >
              <MoreVertical size={14} />
            </button>
            {isProfile ? <span className="absolute bottom-1.5 right-1.5 z-20 grid size-6 place-items-center rounded-full bg-gradient-to-br from-[#8c45ff] to-[#f34ca4] text-white ring-2 ring-white"><Check size={14} strokeWidth={3} /></span> : null}
            {open ? <div className={`absolute top-[calc(100%+8px)] z-[100] w-[148px] overflow-hidden rounded-xl bg-white py-1 text-left shadow-[0_14px_36px_rgba(42,35,70,.22)] ${menuPosition}`}>
              <button
                type="button"
                disabled={isProfile}
                onClick={() => void setAsProfile(photo)}
                className="flex h-10 w-full items-center gap-2 px-3 text-[11px] font-semibold text-[#7d39e8] disabled:text-[#a8a8b2]"
              >
                <Check size={14} />
                {isProfile ? "Profile photo" : "Set as profile"}
              </button>
              <button
                type="button"
                onClick={() => void removePhoto(photo)}
                className="flex h-10 w-full items-center gap-2 px-3 text-[11px] font-semibold text-[#e33d83]"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div> : null}
          </div>;
        })}
        {photos.length < 6 && <button onClick={onAddPhoto}><b>＋</b><span>Add Photo</span></button>}
      </div>
    </section>
    <div className="relative z-0 space-y-4 px-3 pb-6">
      <DetailCard title="Lifestyle" items={profile.lifestyle} />
      <DetailCard title="Family" items={profile.family} />
      <DetailCard title="What I&apos;m Looking For" items={profile.preferences} columns={4} editSection="Partner Preferences" />
      <DetailCard title="Horoscope" items={profile.horoscope} />
    </div>
  </div>;
}
