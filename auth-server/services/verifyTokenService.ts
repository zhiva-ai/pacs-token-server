import { Request, Response } from "express";
import { trimJWT, validateToken } from "../utils/jwt";

async function validateAccessToken(
  authorizationHeader: string,
  origin?: string
) {
  let token = trimJWT(authorizationHeader);

  const tokenPayload = await validateToken(token);

  if (origin !== tokenPayload.aud) {
    return false;
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
    .catch((e) => {
      console.error(e);
      response.status(401);
      return response.send();
    });
}
