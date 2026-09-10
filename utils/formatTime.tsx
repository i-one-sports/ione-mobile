export const formatTime = (dateString?: string) => {
  if (!dateString) return "Time TBD";

  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
