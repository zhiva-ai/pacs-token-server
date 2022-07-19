import {
  JwtPayload,
  sign,
  SignOptions,
  verify,
  VerifyOptions,
} from "jsonwebtoken";
import * as fs from "fs";
import * as path from "path";
import { ACCESS_TOKEN_EXPIRATION } from "./constants";

export type TokenPayload = JwtPayload & {
  name: string;
  username?: string;
  canEditResource: boolean;
  studyUID?: string;
  pacs?: string;
  tokenServer?: string;
  refreshServer?: string;
  accessTypes?: string[];
  aud?: string; // authorized domain
};

const defaultOptions: SignOptions = {
  algorithm: "RS256",
  issuer: "zhiva.ai",
  expiresIn: ACCESS_TOKEN_EXPIRATION,
};

const defaultVerifyOptions: VerifyOptions = {
  algorithms: ["RS256"],
  issuer: "zhiva.ai",
};

export enum TOKEN_ERROR_MESSAGES {
  INVALID_TOKEN = "Invalid Token",
  MISSING_TOKEN = "Missing Token",
  EXPIRED_TOKEN = "Token Expired",
  UNAUTHORIZED_TOKEN = "Unauthorized",
  OTHER_ERROR = "Unexpected error",
}

export const TOKEN_ERROR_CODES: Record<string, number> = {
  [TOKEN_ERROR_MESSAGES.INVALID_TOKEN]: 403,
  [TOKEN_ERROR_MESSAGES.MISSING_TOKEN]: 401,
  [TOKEN_ERROR_MESSAGES.EXPIRED_TOKEN]: 401,
  [TOKEN_ERROR_MESSAGES.OTHER_ERROR]: 400,
};

export function trimJWT(token: string) {
  if (token.toLowerCase().startsWith("bearer")) {
    return token.slice("bearer".length).trim();
  }
  return token;
}

/**
 * generates JWT
 */
export function generateToken(
  payload: TokenPayload,
  signInOptions: SignOptions = {}
): string {
  // read private key value
  const privateKey = fs.readFileSync(path.join(__dirname, "./../priv.pem"));

  // generate JWT
  return sign(payload, privateKey, { ...defaultOptions, ...signInOptions });
}

export function validateToken(
  token: string,
  verifyOptions: VerifyOptions = defaultVerifyOptions
): Promise<TokenPayload> {
  // read public key value
  const publicKey = fs.readFileSync(path.join(__dirname, "./../pub.pem"));

  return new Promise((resolve, reject) => {
    verify(
      token,
      publicKey,
      { ...defaultOptions, ...verifyOptions },
      (err, decoded) => {
        if (err) return reject(err);

        resolve(decoded as TokenPayload);
      }
    );
  });
}
