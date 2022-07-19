import { Request, Response } from "express";
import { TOKEN_ERROR_CODES, TOKEN_ERROR_MESSAGES } from "../utils/jwt";
import {
  User,
  USER_ERROR_CODES,
  USER_ERROR_MESSAGES,
} from "../db/schemas/user";
import { comparePasswords, UserPayload } from "../utils/user";
import { createAuthTokenGenerator } from "./helpers/generateAuthTokenForUser";

async function getUserFromRequest(request: Request<{}, {}, UserPayload>) {
  let selectedUser = await User.findOne({ username: request.body.username });

  if (!selectedUser || !selectedUser.password) {
    throw Error(USER_ERROR_MESSAGES.INVALID_DATA);
  }

  const isPasswordValid = await comparePasswords(
    request.body.password,
    selectedUser.password || ""
  );

  if (!isPasswordValid) {
    throw Error(USER_ERROR_MESSAGES.INVALID_DATA);
  }

  return selectedUser;
}

function validateRequest(
  request: Request<{}, {}, UserPayload>,
  response: Response
) {
  if (
    !request.body?.username ||
    (request.body?.username && request.body?.username.length < 1)
  ) {
    response.status(400);
    return response.send({ message: USER_ERROR_MESSAGES.USERNAME_MISSING });
  }
  if (
    !request.body?.password ||
    (request.body?.password && request.body?.password.length < 1)
  ) {
    response.status(400);
    return response.send({ message: USER_ERROR_MESSAGES.INVALID_DATA });
  }
}

export function signInUserService(
  request: Request<{}, {}, UserPayload>,
  response: Response
) {
  validateRequest(request, response);

  getUserFromRequest(request)
    .then(createAuthTokenGenerator({ origin: request.body?.referer }))
    .then((newToken) => {
      response.status(200);
      response.send({ token: newToken });
    })
    .catch((error) => {
      console.error(error);
      if (
        Object.keys(TOKEN_ERROR_CODES).includes(error.message) ||
        Object.keys(USER_ERROR_CODES).includes(error.message)
      ) {
        if (Object.keys(TOKEN_ERROR_CODES).includes(error.message)) {
          response.status(TOKEN_ERROR_CODES[error.message]);
        } else {
          response.status(USER_ERROR_CODES[error.message]);
        }
      } else {
        response.status(500);
      }
      if (
        Object.values(USER_ERROR_MESSAGES).includes(error.message) ||
        Object.values(TOKEN_ERROR_MESSAGES).includes(error.message)
      ) {
        return response.send({ message: error.message });
      }

      response.send({ message: USER_ERROR_MESSAGES.OTHER_ERROR });
    });
}
