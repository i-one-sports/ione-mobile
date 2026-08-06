export interface ProfileUpdatePayloadInput {
  firstName?: string;
  lastName?: string;
  nickname?: string;
  phoneNumber?: string;
  address?: string;
  position?: string;
  height?: number;
  dateOfBirth?: string;
  avatar?: string;
}

export const buildProfileUpdatePayload = (input: ProfileUpdatePayloadInput) => {
  const payload: ProfileUpdatePayloadInput = {};

  if (input.firstName) payload.firstName = input.firstName;
  if (input.lastName) payload.lastName = input.lastName;
  if (input.nickname) payload.nickname = input.nickname;
  if (input.phoneNumber) payload.phoneNumber = input.phoneNumber;
  if (input.address) payload.address = input.address;
  if (input.position) payload.position = input.position;
  if (typeof input.height === "number") payload.height = input.height;
  if (input.dateOfBirth) payload.dateOfBirth = input.dateOfBirth;
  if (input.avatar) payload.avatar = input.avatar;

  return payload;
};
