export type HoroscopeItem = { label: string; value: string };

export type HoroscopeBirthDetails = {
  birthTime?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
};

const horoscopeOrder = [
  "Date of Birth",
  "Time of Birth",
  "Birth Country",
  "Birth State",
  "Birth City",
  "Zodiac Sign",
  "Nakshatra",
  "Rashi / Moon Sign",
  "Lagna / Ascendant",
] as const;

export function zodiacSignForDate(dateValue: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue.trim());
  if (!match) return "";

  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return "";

  const boundary = [
    [1, 20, "Aquarius", "Capricorn"],
    [2, 19, "Pisces", "Aquarius"],
    [3, 21, "Aries", "Pisces"],
    [4, 20, "Taurus", "Aries"],
    [5, 21, "Gemini", "Taurus"],
    [6, 21, "Cancer", "Gemini"],
    [7, 23, "Leo", "Cancer"],
    [8, 23, "Virgo", "Leo"],
    [9, 23, "Libra", "Virgo"],
    [10, 23, "Scorpio", "Libra"],
    [11, 22, "Sagittarius", "Scorpio"],
    [12, 22, "Capricorn", "Sagittarius"],
  ] as const;
  const [, startDay, currentSign, previousSign] = boundary[month - 1];
  return day >= startDay ? currentSign : previousSign;
}

export function generatedHoroscopeItems(
  birthDate: string | null | undefined,
  savedItems: HoroscopeItem[],
  birthDetails: HoroscopeBirthDetails = {},
) {
  const values = new Map(
    savedItems
      .map((item) => [item.label, item.value.trim()] as const)
      .filter(([, value]) => value && value.toLowerCase() !== "not added"),
  );
  const addFallback = (label: string, value?: string | null) => {
    const normalized = value?.trim();
    if (normalized && !values.has(label)) values.set(label, normalized);
  };

  addFallback("Date of Birth", birthDate);
  addFallback("Time of Birth", birthDetails.birthTime);
  addFallback("Birth Country", birthDetails.country);
  addFallback("Birth State", birthDetails.state);
  addFallback("Birth City", birthDetails.city);

  const zodiac = birthDate ? zodiacSignForDate(birthDate) : "";
  if (zodiac) values.set("Zodiac Sign", zodiac);

  const ordered = horoscopeOrder.flatMap((label) => {
    const value = values.get(label);
    return value ? [{ label, value }] : [];
  });
  const knownLabels = new Set<string>(horoscopeOrder);
  const custom = Array.from(values, ([label, value]) => ({ label, value })).filter(
    (item) => !knownLabels.has(item.label),
  );
  return [...ordered, ...custom];
}
