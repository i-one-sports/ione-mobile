import { maskEmail } from "@/utils/maskEmail";

describe("maskEmail", () => {
  it("keeps only the first character of the local part and masks the rest", () => {
    expect(maskEmail("johndoe@example.com")).toBe("j******@example.com");
  });

  it("returns the original value when no email is provided", () => {
    expect(maskEmail("")).toBe("");
  });
});
