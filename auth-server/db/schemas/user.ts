import { Schema, model, Types } from "mongoose";

interface IUser {
  name: string;
  username: string;
  password?: string;
  authToken?: string;
  accessTokens?: Types.DocumentArray<Types.ObjectId>;
  refreshTokens?: Types.DocumentArray<Types.ObjectId>;
  createdAt: number;
  canEditResource?: boolean;
}

export const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String },
  authToken: { type: String },
  canEditResource: { type: Boolean },
  accessTokens: [{ type: Schema.Types.ObjectId, ref: "Token" }],
  refreshTokens: [{ type: Schema.Types.ObjectId, ref: "Token" }],
});

export enum USER_ERROR_MESSAGES {
  NAME_MISSING = "Name not valid",
  USERNAME_MISSING = "username not valid",
  INVALID_DATA = "Invalid data",
  USER_EXISTS = "User already exists",
  USER_DOESNT_EXISTS = "User doesn't exists",
  ADMIN_PASSWORD_INVALID = "Invalid admin password",
  OTHER_ERROR = "Unexpected error",
}

export const USER_ERROR_CODES: Record<string, number> = {
  [USER_ERROR_MESSAGES.NAME_MISSING]: 400,
  [USER_ERROR_MESSAGES.USERNAME_MISSING]: 400,
  [USER_ERROR_MESSAGES.INVALID_DATA]: 400,
  [USER_ERROR_MESSAGES.USER_EXISTS]: 400,
  [USER_ERROR_MESSAGES.USER_DOESNT_EXISTS]: 400,
  [USER_ERROR_MESSAGES.ADMIN_PASSWORD_INVALID]: 400,
  [USER_ERROR_MESSAGES.OTHER_ERROR]: 400,
}

export const User = model<IUser>("User", userSchema);
