/** Lowercase without Polish diacritics, so "zolc" finds "żółć". */
export const fold = (text: string) =>
  text.toLowerCase().replace(/ł/g, "l").normalize("NFKD").replace(/[̀-ͯ]/g, "");
