import type { DetailItem } from "./my-profile";
export type EditSection =
  | "Basic Details"
  | "Photos"
  | "Lifestyle"
  | "Family"
  | "Partner Preferences"
  | "Horoscope"
  | "Profile Visibility";
export interface EditProfileData {
  id: string;
  completion: number;
  displayName: string;
  birthDate: string;
  gender: string;
  maritalStatus: string;
  religion: string;
  motherTongue: string;
  height: string;
  weight: string;
  city: string;
  state: string;
  country: string;
  education: string;
  profession: string;
  company: string;
  about: string;
  photos: string[];
  lifestyle: DetailItem[];
  family: DetailItem[];
  preferences: DetailItem[];
  horoscope: DetailItem[];
  visibility: "everyone" | "connections" | "private";
  visibilityDetails: Record<string, boolean>;
  avatar: string;
}
export const editSections: EditSection[] = [
  "Basic Details",
  "Photos",
  "Lifestyle",
  "Family",
  "Partner Preferences",
  "Horoscope",
  "Profile Visibility",
];
export const lifestyleLabels = [
  "Diet",
  "Body Type",
  "Height",
  "Physical Status",
  "Smoking",
  "Drinking",
  "Exercise",
  "Sleep",
  "Blood Group",
  "About My Lifestyle",
];
export const familyLabels = [
  "Father's Occupation",
  "Father's Education",
  "Mother's Occupation",
  "Mother's Education",
  "Family Type",
  "Siblings",
  "Family Values",
  "Family Income",
  "Family Country",
  "Family State",
  "Family City",
  "Family Background",
  "About My Family",
];
export const preferenceLabels = [
  "Looking For",
  "Age Range",
  "Height",
  "Marital Status",
  "Preferred Country",
  "Preferred State",
  "Preferred City",
  "Religion",
  "Caste (Optional)",
  "Education",
  "Profession",
  "Annual Income",
  "Diet",
  "Smoking",
  "Drinking",
  "Family Type",
  "Family Values",
  "Relocation",
  "About My Ideal Partner",
];
export const horoscopeLabels = [
  "Date of Birth",
  "Time of Birth",
  "Birth Country",
  "Birth State",
  "Birth City",
  "Zodiac Sign",
  "Nakshatra",
  "Rashi / Moon Sign",
  "Lagna / Ascendant",
];
