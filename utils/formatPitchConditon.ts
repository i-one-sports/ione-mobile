export const formatPitchCondition = (value?: string) => {
  if (!value) return "";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
