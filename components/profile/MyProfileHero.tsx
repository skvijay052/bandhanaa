import Link from "next/link";
import { BadgeCheck, Camera, MapPin, MoreHorizontal } from "lucide-react";

import type { MyProfileData } from "@/data/my-profile";
import { ProfileImage } from "@/components/ui/ProfileImage";

export function MyProfileHero({ profile, acceptedInterestCount, onEdit, onPhotoClick }: { profile: MyProfileData; acceptedInterestCount: number; onEdit: () => void; onPhotoClick: () => void }) {
  return (
    <section className="px-4 py-8 max-md:px-4 max-md:py-5">
      <div className="grid grid-cols-[190px_minmax(0,1fr)] gap-8 max-md:block">
        <button onClick={onPhotoClick} aria-label="Change profile photo" className="relative mx-auto block size-[180px] max-md:size-[132px]">
          <span className="relative block size-full overflow-hidden rounded-full bg-[#efefef]"><ProfileImage src={profile.avatar} alt={`${profile.name}'s profile`} fill priority sizes="(max-width:767px) 132px,180px" className="object-cover" /></span>
          <span className="absolute bottom-1 right-1 grid size-9 place-items-center rounded-full border-2 border-white bg-[#1d9bf0] text-white"><Camera size={16} /></span>
        </button>
        <div className="min-w-0 max-md:mt-4">
          <h2 className="flex items-center gap-2 text-[22px] font-bold tracking-[-.02em] text-[var(--text-primary)] max-md:text-[20px]">
            {profile.name}
            {profile.verified ? <BadgeCheck size={20} className="fill-[#1d9bf0] text-[#1d9bf0] [&>path:last-child]:text-white" /> : null}
         
          </h2>
          <p className="mt-1 text-[14px] font-normal text-[var(--text-secondary)]">{profile.profession}{profile.company ? ` at ${profile.company}` : ""}</p>
          <div className="mt-4 flex flex-wrap gap-7 text-[14px] font-normal text-[var(--text-primary)]">
            <span><strong>{profile.photos.length}</strong> {profile.photos.length === 1 ? "photo" : "photos"}</span>
            <span><strong>{acceptedInterestCount}</strong> following</span>
          </div>
          <p className="mt-5 max-w-[650px] text-[14px] font-normal leading-6 text-[var(--text-primary)]">{profile.about}</p>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-[14px] text-[var(--text-secondary)]"><MapPin size={14} />{[profile.city, profile.state, profile.country].filter(Boolean).join(", ")}<span>·</span>{profile.age ? `${profile.age} years` : "Age not added"}<span>·</span>Member since {profile.memberSince}</p>
        </div>
      </div>
      <div className="profile-action-row ml-[222px] mt-7 max-md:ml-0">
        <button onClick={onEdit} className="profile-action-secondary">Edit profile</button>
        <Link href="/settings/privacy" className="profile-action-secondary">Profile settings</Link>
      </div>
    </section>
  );
}
