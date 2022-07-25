import { Request, Response } from "express";
import {
  TOKEN_ERROR_CODES,
  TOKEN_ERROR_MESSAGES,
  TokenPayload,
  trimJWT,
  validateToken,
} from "../utils/jwt";
import { User } from "../db/schemas/user";
import { createAccessTokenGenerator } from "./helpers/generateAccessTokenForUser";

async function validateAuthToken(authorizationHeader: string, origin?: string) {
  let token = trimJWT(authorizationHeader);
  const tokenPayload = await validateToken(token);

  // Check if auth token didn't expire
  if (Number(tokenPayload.exp) < Math.floor(Date.now() / 1000)) {
    throw Error(TOKEN_ERROR_MESSAGES.EXPIRED_TOKEN);
  }

  if (tokenPayload.aud && origin !== tokenPayload.aud) {
    throw Error(TOKEN_ERROR_MESSAGES.INVALID_TOKEN);
  }

  let selectedUser = await User.findOne({
    username: tokenPayload.username,
    authToken: token,
  });

  // Check if auth token exists in DB
  if (!selectedUser) {
    throw Error(TOKEN_ERROR_MESSAGES.INVALID_TOKEN);
  }

  return selectedUser;
}

export function generateAccessTokenService(
  request: Request<{}, {}, TokenPayload>,
  response: Response
) {
  if (!request.headers["authorization"]) {
    response.status(401);
    return response.send({ message: TOKEN_ERROR_MESSAGES.MISSING_TOKEN });
  }

  validateAuthToken(request.headers["authorization"], request.get("origin"))
    .then(createAccessTokenGenerator(request.get("origin")))
    .then(({ accessToken, refreshToken }) => {
      response.status(200);
      response.setHeader("Authorization", `Bearer ${accessToken}`);
      response.send(refreshToken);
    })
    .catch((error) => {
      console.error(error);
      if (Object.keys(TOKEN_ERROR_CODES).includes(error.message)) {
        response.status(TOKEN_ERROR_CODES[error.message]);
      } else {
        response.status(500);
      }
      if (Object.values(TOKEN_ERROR_MESSAGES).includes(error.message)) {
        return response.send({ message: error.message });
      }
      response.send({ message: TOKEN_ERROR_MESSAGES.OTHER_ERROR });
    });
}
