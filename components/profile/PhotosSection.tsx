import { ProfileImage } from "@/components/ui/ProfileImage";
import { MoreVertical, Plus, Trash2, UserRound } from "lucide-react";
import type { MyProfileData } from "@/data/my-profile";
export function PhotosSection({
  profile,
  mobile = false,
  onAdd,
  onSetProfilePicture,
  onDeletePhoto,
}: {
  profile: MyProfileData;
  mobile?: boolean;
  onAdd: () => void;
  onSetProfilePicture: (photo: string) => Promise<void>;
  onDeletePhoto: (photo: string) => Promise<void>;
}) {
  return (
    <section
      className={`${mobile ? "" : "rounded-2xl border border-[#e6edf2] bg-white p-5 shadow-[0_8px_24px_rgba(15,20,25,.035)]"}`}
    >
      <div className="flex justify-between">
        <div>
          <h2 className="text-[18px] font-bold">
            Photos ({Math.min(profile.photos.length, 6)} of 6)
          </h2>
          {mobile ? null : (
            <p className="mt-1 text-[14px] text-[#596077]">
              Add more photos to get better matches.
            </p>
          )}
        </div>
        <button
          onClick={onAdd}
          disabled={profile.photos.length >= 6}
          className="text-[14px] font-semibold text-[#1d9bf0] disabled:text-[#a7a9b3]"
        >
          {mobile ? "Add" : "Add Photos"}
        </button>
      </div>
      <div className={`mt-4 grid grid-cols-6 ${mobile ? "gap-1.5" : "gap-2"}`}>
        {profile.photos.slice(0, 5).map((photo, i) => (
          <div
            key={`${photo}-${i}`}
            className="relative aspect-[.82/1] rounded-xl"
          >
            <span className="absolute inset-0 overflow-hidden rounded-xl">
              <ProfileImage
                src={photo}
                alt={`${profile.name} photo ${i + 1}`}
                fill
                sizes={mobile ? "52px" : "95px"}
                className="object-cover"
              />
            </span>
            <details className="group absolute right-1.5 top-1.5 z-10">
              <summary aria-label={`Photo ${i + 1} options`} className="grid size-8 cursor-pointer list-none place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm hover:bg-black/70 [&::-webkit-details-marker]:hidden">
                <MoreVertical size={18} />
              </summary>
              <div className="absolute right-0 top-9 w-[180px] overflow-hidden rounded-xl border border-[#cfd9de] bg-white py-1 text-[#0f1419] shadow-[0_8px_28px_rgba(15,20,25,.18)]">
                <button type="button" onClick={(event) => { event.currentTarget.closest("details")?.removeAttribute("open"); void onSetProfilePicture(photo); }} className="flex h-10 w-full items-center gap-3 px-3 text-left text-[13px] font-medium hover:bg-[#f7f9f9]">
                  <UserRound size={17} />
                  Set as profile picture
                </button>
                <button type="button" onClick={(event) => { event.currentTarget.closest("details")?.removeAttribute("open"); void onDeletePhoto(photo); }} className="flex h-10 w-full items-center gap-3 px-3 text-left text-[13px] font-medium text-[#f4212e] hover:bg-[#fff5f5]">
                  <Trash2 size={17} />
                  Delete
                </button>
              </div>
            </details>
          </div>
        ))}
        {profile.photos.length < 6 ? (
          <button
            onClick={onAdd}
            aria-label="Add photo"
            className="flex aspect-[.82/1] flex-col items-center justify-center rounded-xl border border-dashed border-[#b8c9d6] text-[12px] text-[#344054] hover:border-[#1d9bf0] hover:bg-[#f5fbff]"
          >
            <Plus size={mobile ? 15 : 20} />
            {mobile ? null : <span className="mt-1">Add Photo</span>}
          </button>
        ) : null}
      </div>
    </section>
  );
}
