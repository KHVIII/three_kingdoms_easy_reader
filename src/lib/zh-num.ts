const DIGITS = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

export function toZhNum(n: number): string {
  if (n <= 10) return ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"][n];
  if (n < 20) return "十" + DIGITS[n - 10];
  if (n < 100) {
    const t = Math.floor(n / 10), o = n % 10;
    return DIGITS[t] + "十" + (o ? DIGITS[o] : "");
  }
  const h = Math.floor(n / 100), rest = n % 100;
  if (rest === 0) return DIGITS[h] + "百";
  if (rest < 10) return DIGITS[h] + "百零" + DIGITS[rest];
  const t = Math.floor(rest / 10), o = rest % 10;
  return DIGITS[h] + "百" + DIGITS[t] + "十" + (o ? DIGITS[o] : "");
}
