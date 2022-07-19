import * as bcrypt from "bcrypt";

export type UserPayload = {
  username: string;
  password: string;
  referer: string;
};

export async function hashPassword(password: string) {
  try {
    return await bcrypt.hash(password, 10);
  } catch (e) {
    return undefined;
  }
}

export async function comparePasswords(
  password: string,
  hashedPassword: string
) {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (e) {
    return false;
  }
}
