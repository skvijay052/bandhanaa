const range = (start: number, end: number, suffix = "") =>
  Array.from({ length: end - start + 1 }, (_, index) => `${start + index}${suffix}`);

const occupations = [
  "Accountant", "Architect", "Artist", "Business", "Civil Services", "Consultant",
  "Doctor", "Engineer", "Entrepreneur", "Farmer", "Government Employee", "Homemaker",
  "Lawyer", "Manager", "Marketing Professional", "Nurse", "Product Designer",
  "Researcher", "Self Employed", "Software Engineer", "Student", "Teacher", "Other",
];
const education = [
  "High School", "Diploma", "Bachelor's Degree", "B.A", "B.Com", "B.E", "B.Sc",
  "B.Tech", "Graduate and above", "Master's Degree", "M.A", "M.Com", "M.E", "M.Sc",
  "M.Tech", "MBA", "MBBS", "PhD", "Professional Degree", "Other",
];
const locations = [
  "Ahmedabad, Gujarat", "Bengaluru, Karnataka", "Bhopal, Madhya Pradesh",
  "Chandigarh", "Chennai, Tamil Nadu", "Coimbatore, Tamil Nadu", "Delhi",
  "Gurugram, Haryana", "Hyderabad, Telangana", "Jaipur, Rajasthan", "Kochi, Kerala",
  "Kolkata, West Bengal", "Lucknow, Uttar Pradesh", "Mumbai, Maharashtra",
  "Mysuru, Karnataka", "Nagpur, Maharashtra", "Noida, Uttar Pradesh", "Pune, Maharashtra",
  "Thiruvananthapuram, Kerala", "Visakhapatnam, Andhra Pradesh", "Open to relocate", "Other",
];
const religions = [
  "Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Parsi",
  "Jewish", "Spiritual", "No Religion", "Other",
];
const casteByReligion: Record<string, string[]> = {
  Hindu: ["Any", "Brahmin", "Kshatriya", "Vaishya", "Kayastha", "Lingayat", "Nair", "Reddy", "Vokkaliga", "Other"],
  Muslim: ["Any", "Sunni", "Shia", "Sufi", "Other"],
  Christian: ["Any", "Catholic", "Orthodox", "Protestant", "Other"],
  Sikh: ["Any", "Jat", "Khatri", "Ramgarhia", "Other"],
  Jain: ["Any", "Digambar", "Shwetambar", "Other"],
};
const heights = Array.from({ length: 37 }, (_, index) => 48 + index).map((inches) => {
  const feet = Math.floor(inches / 12);
  const remainder = inches % 12;
  return `${feet}'${remainder}\" (${Math.round(inches * 2.54)} cm)`;
});
const times = Array.from({ length: 96 }, (_, index) => {
  const hour = Math.floor(index / 4);
  const minute = (index % 4) * 15;
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
});

const options: Record<string, string[]> = {
  Gender: ["Female", "Male", "Non-binary", "Prefer not to say"],
  "Marital Status": ["Never Married", "Divorced", "Widowed", "Awaiting Divorce", "Annulled"],
  Religion: religions,
  "Mother Tongue": ["Assamese", "Bengali", "English", "Gujarati", "Hindi", "Kannada", "Kashmiri", "Malayalam", "Marathi", "Odia", "Punjabi", "Sindhi", "Tamil", "Telugu", "Urdu", "Other"],
  Height: heights,
  Weight: range(35, 150, " kg"),
  Location: locations,
  Lifestyle: ["Active", "Balanced", "Home-oriented", "Travel-focused", "Spiritual"],
  "Family Location": locations,
  "Birth Place": locations,
  Education: education,
  Profession: occupations,
  Diet: ["Vegetarian", "Eggetarian", "Non-Vegetarian", "Vegan", "Jain", "Other"],
  "Body Type": ["Slim", "Athletic", "Average", "Heavy"],
  "Physical Status": ["Normal", "Physically Challenged"],
  Smoking: ["No", "Occasionally", "Yes", "Trying to quit"],
  Drinking: ["No", "Occasionally", "Socially", "Yes"],
  Exercise: ["Daily", "Regularly", "Occasionally", "Rarely", "Never"],
  Sleep: ["Less than 6 hours", "6-7 hours", "7-8 hours", "8-9 hours", "More than 9 hours"],
  "Blood Group": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Don't know"],
  "Father's Occupation": occupations,
  "Mother's Occupation": occupations,
  "Father's Education": education,
  "Mother's Education": education,
  "Family Type": ["Nuclear Family", "Joint Family", "Extended Family", "Other"],
  Siblings: ["None", "1 Younger Brother", "1 Elder Brother", "1 Younger Sister", "1 Elder Sister", "2 Siblings", "3 Siblings", "4 or more Siblings"],
  "Family Values": ["Traditional", "Moderate", "Liberal", "Modern with traditional values"],
  "Family Income": ["Below 3 Lakh", "3-5 Lakh", "5-10 Lakh", "10-20 Lakh", "20-50 Lakh", "50 Lakh-1 Crore", "Above 1 Crore", "Prefer not to say"],
  "Family Background": ["Lower Middle Class", "Middle Class", "Upper Middle Class", "Affluent"],
  "Looking For": ["Life Partner", "Marriage", "Serious Relationship", "Companionship"],
  "Age Range": ["18 - 23 Years", "21 - 27 Years", "24 - 32 Years", "28 - 35 Years", "32 - 40 Years", "35 - 45 Years", "40 - 55 Years", "Any"],
  "Annual Income": ["Any", "Below 3 Lakh", "3-5 Lakh", "5-10 Lakh", "10-20 Lakh", "20-50 Lakh", "50 Lakh-1 Crore", "Above 1 Crore"],
  Relocation: ["Open to relocate", "Within my city", "Within my state", "Within India", "Not willing to relocate", "Any"],
  "Time of Birth": times,
  "Zodiac Sign": ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"],
  Nakshatra: ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"],
  "Rashi / Moon Sign": ["Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)", "Karka (Cancer)", "Simha (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrishchika (Scorpio)", "Dhanu (Sagittarius)", "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)"],
  "Lagna / Ascendant": ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"],
};

export function profileFieldOptions(label: string, religion = "") {
  if (label === "Caste" || label === "Caste (Optional)") return casteByReligion[religion] ?? ["Any", "Other"];
  return options[label] ?? [];
}
