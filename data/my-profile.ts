export interface DetailItem {
  label: string;
  value: string;
}
export interface MyProfileData {
  id: string;
  name: string;
  age: number;
  profession: string;
  company: string;
  city: string;
  state: string;
  country: string;
  gender: string;
  weight: string;
  religion: string;
  education: string;
  height: string;
  motherTongue: string;
  maritalStatus: string;
  birthDate: string;
  compatibility: number;
  discoverable: boolean;
  completion: number;
  verified: boolean;
  about: string;
  avatar: string;
  photos: string[];
  memberSince: string;
  visibility: "everyone" | "connections" | "private";
  lifestyle: DetailItem[];
  family: DetailItem[];
  preferences: DetailItem[];
  horoscope: DetailItem[];
}
export const profileDefaults = {
  company: "TechNova",
  religion: "Hindu",
  education: "B.Tech",
  height: `5'6"`,
  motherTongue: "Kannada",
  maritalStatus: "Never Married",
  completion: 85,
  memberSince: "May 2024",
  about:
    "I'm a product designer who loves turning ideas into meaningful experiences. I enjoy traveling, exploring new places, listening to music and spending quality time with family and friends.",
  lifestyle: [
    { label: "Diet", value: "Vegetarian" },
    { label: "Smoke", value: "No" },
    { label: "Drink", value: "Occasionally" },
    { label: "Exercise", value: "Regularly" },
    { label: "Sleep", value: "7-8 hours" },
    { label: "Pets", value: "No Pets" },
  ],
  family: [
    { label: "Father's Occupation", value: "Business" },
    { label: "Mother's Occupation", value: "Homemaker" },
    { label: "Family Type", value: "Nuclear Family" },
    { label: "Family Values", value: "Modern with traditional values" },
    { label: "Siblings", value: "1 Elder Brother" },
    { label: "Family Location", value: "Bengaluru" },
  ],
  preferences: [
    { label: "Age Range", value: "26 - 32 years" },
    { label: "Height", value: `5'5" and above` },
    { label: "Education", value: "Graduate and above" },
    { label: "Profession", value: "Any" },
    { label: "Location", value: "Bengaluru or open to relocate" },
    { label: "Religion", value: "Hindu" },
    { label: "Marital Status", value: "Never Married" },
  ],
};
