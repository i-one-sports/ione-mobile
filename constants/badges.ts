import { BadgeType } from "@/components/typings/badge";

// How each badge looks. Add new badge types here as the API adds them.
export const BADGES: Record<
  BadgeType,
  { code: string; title: string; message: string; highlight: string }
> = {
  LICENCE_TO_MISS: {
    code: "007",
    title: "Licence to Miss",
    message:
      "Ogbeni! Seven sessions, seven different days — no goal, no assist. You don officially join the {highlight}. Even the goalpost don dey ask of you. But we no go give up on you o — next match, na you go burst that net!",
    highlight: "007 club",
  },
};

/** Falls back to the raw type for badges this app version doesn't know yet. */
export const badgeInfo = (type: string) =>
  BADGES[type as BadgeType] ?? {
    code: "★",
    title: type,
    message: "You unlocked a new badge.",
    highlight: "",
  };
