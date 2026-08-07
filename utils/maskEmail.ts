export const maskEmail = (email: string) => {
  if (!email) return "";

  const [localPart, domain] = email.split("@", 2);
  if (!localPart || !domain) return email;

  const firstChar = localPart[0] ?? "";
  const maskedLocalPart = `${firstChar}${"*".repeat(Math.max(localPart.length - 1, 0))}`;

  return `${maskedLocalPart}@${domain}`;
};
