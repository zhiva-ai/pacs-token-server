import { Request, Response } from "express";
import {
  TOKEN_ERROR_CODES,
  TOKEN_ERROR_MESSAGES,
  trimJWT,
  validateToken,
} from "../utils/jwt";

async function validateAccessToken(
  authorizationHeader: string,
  origin?: string
) {
  let token = trimJWT(authorizationHeader);

  const tokenPayload = await validateToken(token);

  if (tokenPayload.aud && origin !== tokenPayload.aud) {
    return false;
  }

  if (Number(tokenPayload.exp) < Math.floor(Date.now() / 1000)) {
    throw Error(TOKEN_ERROR_MESSAGES.EXPIRED_TOKEN);
  }

  return true;
}

export function verifyTokenService(
  request: Request<{}, {}, {}>,
  response: Response
) {
  if (!request.headers["authorization"]) {
    response.status(200);
    return response.send();
  }

  validateAccessToken(
    request.headers["authorization"],
    request.headers["origin"]
  )
    .then((isValid) => {
      if (isValid) {
        response.status(200);
      } else {
        response.status(403);
      }
      return response.send();
    })
    .catch((error) => {
      console.error(error);
      if (Object.keys(TOKEN_ERROR_CODES).includes(error.message)) {
        response.status(TOKEN_ERROR_CODES[error.message]);
      } else {
        response.status(403);
      }
      response.send();
    });
}
