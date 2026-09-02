"use client";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Bookmark, BriefcaseBusiness, CalendarDays, Camera, ChevronDown, GraduationCap, Heart, Languages, MapPin, MessageCircle, Pencil, Ruler, Settings, Sparkles, UserRound, Users, Weight } from "lucide-react";
import type { MyProfileData } from "@/data/my-profile";
import { ProfileImage } from "@/components/ui/ProfileImage";
import { DetailCard } from "./ProfileDetailCards";

export function MobileMyProfileExperience({ profile, stats, onEdit, onAvatar, onAddPhoto }: { profile: MyProfileData; stats: { interested: number; sent: number; shortlisted: number }; onEdit: () => void; onAvatar: () => void; onAddPhoto: () => void }) {
  const location = [profile.city, profile.state, profile.country].filter((v) => v && v !== "Not added").join(", ") || "Location not added";
  const details = [[CalendarDays, "Age", profile.age ? `${profile.age} years` : "Not added"], [CalendarDays, "Date of Birth", profile.birthDate], [UserRound, "Gender", profile.gender], [Ruler, "Height", profile.height], [Weight, "Weight", profile.weight], [Sparkles, "Religion", profile.religion], [Languages, "Mother Tongue", profile.motherTongue], [Heart, "Marital Status", profile.maritalStatus], [MapPin, "Location", location], [GraduationCap, "Education", profile.education], [BriefcaseBusiness, "Profession", profile.profession], [BriefcaseBusiness, "Company", profile.company]] as const;
  const chips = profile.lifestyle.slice(0, 4).map((item) => item.value).filter((v) => v && v !== "Not added");
  const photos = Array.from(new Set([profile.avatar, ...profile.photos].filter(Boolean))).slice(0, 4);
  return <div className="my-profile-mobile md:hidden">
    <header className="my-profile-mobile__header"><Link href="/discover" aria-label="Back"><ArrowLeft /></Link><h1>My Profile</h1><Link href="/settings" aria-label="Settings"><Settings /></Link></header>
    <section className="my-profile-mobile__hero">
      <button className="my-profile-mobile__avatar" onClick={onAvatar} aria-label="Change profile photo"><ProfileImage src={profile.avatar} alt={profile.name} fill priority sizes="112px" className="object-cover" /><span><Camera /></span></button>
      <div className="min-w-0 flex-1"><h2>{profile.name}{profile.verified && <BadgeCheck />}</h2><p className="my-profile-mobile__role">{profile.age || "—"} · {profile.profession}</p><p className="my-profile-mobile__location"><MapPin />{location}</p><p className="my-profile-mobile__complete"><i />Profile is <b>{profile.completion}%</b> complete</p><div className="my-profile-mobile__progress"><span style={{ width: `${profile.completion}%` }} /><b>{profile.completion}%</b></div></div>
    </section>
    <section className="my-profile-mobile__prompt"><span className="my-profile-mobile__prompt-icon"><Heart fill="currentColor" /></span><div><h3>Increase your chances!</h3><p>Complete your profile to get<br />better matches.</p></div><button onClick={onEdit}>Complete Now</button></section>
    <section className="my-profile-mobile__stats">{([[Users, profile.photos.length, "Profile Views"], [Heart, stats.interested, "Interested In Me"], [MessageCircle, stats.sent, "Requests Sent"], [Bookmark, stats.shortlisted, "Shortlisted"]] as const).map(([Icon, value, label]) => <div key={label}><Icon /><strong>{value}</strong><span>{label}</span></div>)}</section>
    <section className="my-profile-mobile__card my-profile-mobile__info-card">
      <div className="my-profile-mobile__section-title"><h3>About Me</h3><button onClick={onEdit}><Pencil /> Edit</button></div><p className="my-profile-mobile__about">{profile.about}</p>{chips.length > 0 && <div className="my-profile-mobile__chips">{chips.map((chip) => <span key={chip}>{chip}</span>)}</div>}<div className="my-profile-mobile__divider" />
      <div className="my-profile-mobile__section-title"><h3>Basic Details</h3><button onClick={onEdit}><Pencil /> Edit</button></div><div className="my-profile-mobile__details">{details.map(([Icon, label, value]) => <div key={label}><span><Icon /></span><p><small>{label}</small><strong>{value || "Not added"}</strong></p></div>)}</div>
    </section>
    <section className="my-profile-mobile__card my-profile-mobile__photos"><div className="my-profile-mobile__section-title"><h3>My Photos</h3><button onClick={onEdit}><Pencil /> Edit</button></div><div className="my-profile-mobile__photo-row">{photos.map((photo, index) => <div key={photo} className={index === 0 ? "is-primary" : ""}><ProfileImage src={photo} alt={`${profile.name} photo ${index + 1}`} fill sizes="90px" className="object-cover" />{index === 0 && <i>✓</i>}</div>)}{photos.length < 6 && <button onClick={onAddPhoto}><b>＋</b><span>Add Photo</span></button>}</div></section>
    <div className="space-y-4 px-3 pb-6">
      <DetailCard title="Lifestyle" items={profile.lifestyle} />
      <DetailCard title="Family" items={profile.family} />
      <DetailCard title="What I&apos;m Looking For" items={profile.preferences} columns={4} editSection="Partner Preferences" />
      <DetailCard title="Horoscope" items={profile.horoscope} />
    </div>
  </div>;
}
