import type { Honorific } from "@/lib/types";

/** Idle / group-photo waiting screen (VER 3). Edit here when copy is finalized. */
export const GROUP_WAIT_COPY = {
  eyebrow: "MB Life",
  line: "Chờ thành viên lên sân khấu",
} as const;

export function isEnglishHonorific(title: Honorific): boolean {
  return title === "Mr" || title === "Ms";
}

export function thanksLine(title: Honorific): string {
  if (isEnglishHonorific(title)) {
    return `Thank you, ${title}.`;
  }
  return `Cảm ơn ${title}`;
}

export function tenurePrefix(title: Honorific): string {
  return isEnglishHonorific(title) ? "for" : "vì";
}

export function tenureSuffix(title: Honorific): string {
  return isEnglishHonorific(title)
    ? "days of moving forward with us."
    : "ngày không ngừng tiến bước.";
}
