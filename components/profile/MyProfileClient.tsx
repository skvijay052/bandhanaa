"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import type { MyProfileData } from "@/data/my-profile";
import { createClient } from "@/lib/supabase/client";
import { genderProfilePhoto } from "@/lib/profile-photo";
import { AboutMeSection } from "./AboutMeSection";
import { CompleteProfileCTA } from "./CompleteProfileCTA";
import { MyProfileHero } from "./MyProfileHero";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobilePageHeader } from "@/components/layout/MobilePageHeader";
import { MobileVisibility } from "./MobileProfileSections";
import { PhotosSection } from "./PhotosSection";
import { PhotoCropModal } from "./PhotoCropModal";
import { DetailCard } from "./ProfileDetailCards";
import { ProfileProgress } from "./ProfileProgress";
import { ProfileTabs } from "./ProfileTabs";
import { MobileMyProfileExperience } from "./MobileMyProfileExperience";
export function MyProfileClient({
  profile,
  acceptedInterestCount,
  sentInterestCount,
  shortlistedCount,
}: {
  profile: MyProfileData;
  acceptedInterestCount: number;
  sentInterestCount: number;
  shortlistedCount: number;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [viewProfile, setViewProfile] = useState(profile);
  const [tab, setTab] = useState("About");
  const [expanded, setExpanded] = useState(false);
  const [uploadMode, setUploadMode] = useState<"avatar" | "gallery">("gallery");
  const [cropSource, setCropSource] = useState("");
  const [uploadError, setUploadError] = useState("");
  const edit = () => router.push("/settings/edit-profile");
  function choosePhoto(mode: "avatar" | "gallery") {
    setUploadError("");
    if (mode === "gallery" && viewProfile.photos.length >= 6) {
      setUploadError("You can upload a maximum of 6 photos.");
      return;
    }
    setUploadMode(mode);
    inputRef.current?.click();
  }
  function selectedFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Please select an image smaller than 10 MB.");
      return;
    }
    setCropSource(URL.createObjectURL(file));
  }
  function closeCrop() {
    if (cropSource) URL.revokeObjectURL(cropSource);
    setCropSource("");
    if (inputRef.current) inputRef.current.value = "";
  }
  async function uploadCroppedPhoto(blob: Blob) {
    if (uploadMode === "gallery" && viewProfile.photos.length >= 6)
      throw new Error("You can upload a maximum of 6 photos.");
    const supabase = createClient();
    const path = `${viewProfile.id}/${crypto.randomUUID()}.jpg`;
    const { error: uploadFailure } = await supabase.storage
      .from("profile-photos")
      .upload(path, blob, { contentType: "image/jpeg", upsert: false });
    if (uploadFailure) throw uploadFailure;
    const { data: publicData } = supabase.storage
      .from("profile-photos")
      .getPublicUrl(path);
    const url = publicData.publicUrl;
    const photos =
      uploadMode === "avatar"
        ? viewProfile.photos
        : [...viewProfile.photos, url].slice(0, 6);
    const update =
      uploadMode === "avatar" ? { avatar_url: url, photos } : { photos };
    const { error: updateFailure } = await supabase
      .from("profiles")
      .update(update)
      .eq("id", viewProfile.id);
    if (updateFailure) {
      await supabase.storage.from("profile-photos").remove([path]);
      throw updateFailure;
    }
    setViewProfile((current) => ({
      ...current,
      avatar: uploadMode === "avatar" ? url : current.avatar,
      photos,
    }));
    closeCrop();
    router.refresh();
  }
  async function setProfilePicture(photo: string) {
    setUploadError("");
    const { error } = await createClient()
      .from("profiles")
      .update({ avatar_url: photo })
      .eq("id", viewProfile.id);
    if (error) {
      setUploadError("Unable to set the profile picture. Please try again.");
      return;
    }
    setViewProfile((current) => ({ ...current, avatar: photo }));
    router.refresh();
  }
  async function deletePhoto(photo: string) {
    setUploadError("");
    const photos = viewProfile.photos.filter((item) => item !== photo);
    const deletingAvatar = viewProfile.avatar === photo;
    const update = deletingAvatar ? { photos, avatar_url: null } : { photos };
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update(update)
      .eq("id", viewProfile.id);
    if (error) {
      setUploadError("Unable to delete the photo. Please try again.");
      return;
    }
    const marker = "/storage/v1/object/public/profile-photos/";
    try {
      const pathname = new URL(photo).pathname;
      const markerIndex = pathname.indexOf(marker);
      if (markerIndex >= 0) {
        const storagePath = decodeURIComponent(
          pathname.slice(markerIndex + marker.length),
        );
        await supabase.storage.from("profile-photos").remove([storagePath]);
      }
    } catch {
      // The database is already correct even if an old external URL cannot be removed.
    }
    setViewProfile((current) => ({
      ...current,
      photos,
      avatar: deletingAvatar
        ? (photos[0] ?? genderProfilePhoto(current.gender))
        : current.avatar,
    }));
    router.refresh();
  }
  return (
    <main className="h-dvh bg-[var(--app-bg)]">
      <div className="app-shell">
        <AppSidebar active="Profile" />
        <div className="app-workspace min-w-0 flex-1 overflow-y-auto pb-[72px] md:pb-0">
          <MobileMyProfileExperience profile={viewProfile} stats={{ interested: acceptedInterestCount, sent: sentInterestCount, shortlisted: shortlistedCount }} onEdit={edit} onAvatar={() => choosePhoto("avatar")} onAddPhoto={() => choosePhoto("gallery")} />
          <div className="hidden md:block">
          <MobilePageHeader
            title="My Profile"
            description="Your details and preferences"
          />
          <div className="mx-auto max-w-[1060px] px-5 pb-8 max-md:px-0">
            <MyProfileHero
              profile={viewProfile}
              acceptedInterestCount={acceptedInterestCount}
              onEdit={edit}
              onPhotoClick={() => choosePhoto("avatar")}
            />
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => selectedFile(event.target.files?.[0])}
            />
            {uploadError ? (
              <p role="alert" className="mt-2 text-[11px] text-red-600">
                {uploadError}
              </p>
            ) : null}
            <div className="sticky top-0 z-40 hidden bg-white/95 backdrop-blur-md md:block">
              <ProfileTabs active={tab} onChange={setTab} />
            </div>
            <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md md:hidden">
              <ProfileTabs active={tab} onChange={setTab} mobile />
            </div>
            <div className="mt-6 px-4 max-md:px-3">
              <ProfileProgress
                value={viewProfile.completion}
                photoCount={viewProfile.photos.length}
              />
            </div>
            <div className="hidden md:block">
              <section
                id="profile-about"
                className="mt-6 scroll-mt-[70px] grid grid-cols-[minmax(0,1fr)_240px] gap-6 px-4"
              >
                <div className="rounded-2xl bg-white px-4 py-2">
                  <AboutMeSection profile={viewProfile} />
                </div>
                <aside className="space-y-4">
                  <section className="rounded-2xl border border-[#e6edf2] bg-white p-5 shadow-[0_8px_24px_rgba(15,20,25,.035)]">
                    <h2 className="text-[17px] font-bold">
                      Profile Visibility
                    </h2>
                    <p className="mt-4 text-[14px] leading-6 text-[#596077]">
                      Your profile is visible to
                      <br />
                      everyone on Bandhanaa.
                    </p>
                    <button
                      onClick={edit}
                      className="mt-5 h-10 rounded-lg border border-[#1d9bf0] px-5 text-[14px] font-semibold text-[#1d9bf0] hover:bg-[#e8f5fe]"
                    >
                      Edit
                    </button>
                  </section>
                  <button
                    onClick={edit}
                    className="flex h-[78px] w-full items-center rounded-2xl border border-[#e6edf2] bg-white px-5 text-left shadow-[0_8px_24px_rgba(15,20,25,.035)] hover:border-[#b9dff8]"
                  >
                    <span>
                      <strong className="block text-[14px]">
                        Who can see my profile?
                      </strong>
                      <span className="mt-2 block text-[13px] text-[#596077]">
                        Everyone
                      </span>
                    </span>
                    <ChevronRight size={15} className="ml-auto" />
                  </button>
                </aside>
              </section>
              <div id="profile-photos" className="mt-6 scroll-mt-[70px] px-4">
                <PhotosSection
                  profile={viewProfile}
                  onAdd={() => choosePhoto("gallery")}
                  onSetProfilePicture={setProfilePicture}
                  onDeletePhoto={deletePhoto}
                />
              </div>
              <div
                id="profile-lifestyle"
                className="mt-4 scroll-mt-[70px] px-4"
              >
                <DetailCard title="Lifestyle" items={viewProfile.lifestyle} />
              </div>
              <div id="profile-family" className="mt-4 scroll-mt-[70px] px-4">
                <DetailCard title="Family" items={viewProfile.family} />
              </div>
              <div
                id="profile-partner-preferences"
                className="mt-4 scroll-mt-[70px] px-4"
              >
                <DetailCard
                  title="What I'm Looking For"
                  items={viewProfile.preferences}
                  columns={4}
                  editSection="Partner Preferences"
                />
              </div>
              <div
                id="profile-horoscope"
                className="mt-4 scroll-mt-[70px] px-4"
              >
                <DetailCard title="Horoscope" items={viewProfile.horoscope} />
              </div>
              <div
                id="profile-verification"
                className="mt-5 scroll-mt-[70px] px-4"
              >
                <CompleteProfileCTA />
              </div>
            </div>
            <div className="space-y-4 px-4 md:hidden">
              <section
                id="profile-about-mobile"
                className="scroll-mt-[76px] pt-5"
              >
                <AboutMeSection
                  profile={viewProfile}
                  mobile
                  expanded={expanded}
                  onExpand={() => setExpanded((x) => !x)}
                />
              </section>
              <div id="profile-photos-mobile" className="scroll-mt-[76px]">
                <PhotosSection
                  profile={viewProfile}
                  mobile
                  onAdd={() => choosePhoto("gallery")}
                  onSetProfilePicture={setProfilePicture}
                  onDeletePhoto={deletePhoto}
                />
              </div>
              <div id="profile-lifestyle-mobile" className="scroll-mt-[76px]">
                <DetailCard title="Lifestyle" items={viewProfile.lifestyle} />
              </div>
              <div id="profile-family-mobile" className="scroll-mt-[76px]">
                <DetailCard title="Family" items={viewProfile.family} />
              </div>
              <div
                id="profile-partner-preferences-mobile"
                className="scroll-mt-[76px]"
              >
                <DetailCard
                  title="What I'm Looking For"
                  items={viewProfile.preferences}
                  columns={4}
                  editSection="Partner Preferences"
                />
              </div>
              <div id="profile-horoscope-mobile" className="scroll-mt-[76px]">
                <DetailCard title="Horoscope" items={viewProfile.horoscope} />
              </div>
              <MobileVisibility visibility={viewProfile.visibility} />
              <CompleteProfileCTA mobile />
            </div>
          </div>
          </div>
        </div>
        {cropSource ? (
          <PhotoCropModal
            source={cropSource}
            onCancel={closeCrop}
            onCrop={uploadCroppedPhoto}
          />
        ) : null}
      </div>
    </main>
  );
}
