export type HoroscopeItem = { label: string; value: string };

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
) {
  const items = savedItems.filter((item) => item.value.trim());
  if (!birthDate) return items;

  const values = new Map(items.map((item) => [item.label, item.value]));
  if (!values.has("Date of Birth")) values.set("Date of Birth", birthDate);

  const zodiac = zodiacSignForDate(birthDate);
  if (zodiac && !values.has("Zodiac Sign")) values.set("Zodiac Sign", zodiac);

  return Array.from(values, ([label, value]) => ({ label, value }));
}
