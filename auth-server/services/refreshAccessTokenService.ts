import { Request, Response } from "express";
import {
  generateToken,
  TOKEN_ERROR_CODES,
  TOKEN_ERROR_MESSAGES,
  TokenPayload,
  trimJWT,
  validateToken,
} from "../utils/jwt";
import { Token } from "../db/schemas/token";
import { User, USER_ERROR_CODES } from "../db/schemas/user";
import { Schema, Types } from "mongoose";
import { ACCESS_TOKEN_EXPIRATION } from "../utils/constants";

async function validateAuthToken(authorizationHeader: string, origin?: string) {
  let token = trimJWT(authorizationHeader);

  let selectedToken = await Token.findOne({
    type: "refresh",
    token: token,
  });

  // Check if refresh token exists in DB
  if (!selectedToken) {
    throw Error(TOKEN_ERROR_MESSAGES.INVALID_TOKEN);
  }

  const tokenPayload = await validateToken(token);

  if (origin !== tokenPayload.aud) {
    throw Error(TOKEN_ERROR_MESSAGES.INVALID_TOKEN);
  }

  // Check if refresh token didn't expire
  if (Number(tokenPayload.exp) < Math.floor(Date.now() / 1000)) {
    throw Error(TOKEN_ERROR_MESSAGES.EXPIRED_TOKEN);
  }

  let selectedUser = await User.findOne({
    username: tokenPayload.username,
    refreshTokens: { $in: [selectedToken._id] },
  });

  // Check if refresh token is assigned to the user
  if (!selectedUser) {
    throw Error(TOKEN_ERROR_MESSAGES.INVALID_TOKEN);
  }

  return selectedUser;
}

function createAccessTokenGenerator(origin?: string) {
  return async function generateAccessTokenForUser(user: any) {
    const newAccessToken = generateToken(
      {
        name: user.name,
        username: user.username,
        canEditResource: Boolean(user.canEditResource),
        aud: origin,
      },
      {
        expiresIn: ACCESS_TOKEN_EXPIRATION,
      }
    );

    const accessToken = new Token({
      type: "access",
      token: newAccessToken,
    });

    await accessToken.save();

    user.accessTokens.push(accessToken._id);
    await user.save();

    return {
      accessToken: accessToken.token,
    };
  };
}

export function refreshTokenService(
  request: Request<{}, {}, TokenPayload>,
  response: Response
) {
  if (!request.headers["authorization"]) {
    response.status(401);
    return response.send({ message: TOKEN_ERROR_MESSAGES.MISSING_TOKEN });
  }

  validateAuthToken(request.headers["authorization"], request.get("origin"))
    .then(createAccessTokenGenerator(request.get("origin")))
    .then(({ accessToken }) => {
      response.status(200);
      response.setHeader("authorization", `Bearer ${accessToken}`);
      response.send();
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
