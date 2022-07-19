import { Request, Response } from "express";
import { TOKEN_ERROR_CODES, TokenPayload } from "../utils/jwt";
import {
  User,
  USER_ERROR_CODES,
  USER_ERROR_MESSAGES,
} from "../db/schemas/user";
import { comparePasswords, hashPassword } from "../utils/user";
import { createAuthTokenGenerator } from "./helpers/generateAuthTokenForUser";

async function getUserFromRequest(request: Request<{}, {}, TokenPayload>) {
  let selectedUser = await User.findOne({ username: request.body.username });

  if (selectedUser && !request.body.createUserIfNotExists) {
    throw Error(USER_ERROR_MESSAGES.USER_EXISTS);
  }
  if (!selectedUser) {
    if (!request.body.createUserIfNotExists) {
      throw Error(USER_ERROR_MESSAGES.USER_DOESNT_EXISTS);
    }
    selectedUser = new User({
      name: request.body.name,
      username: request.body.username,
      canEditResource: request.body.canEditResource || false,
      password: request.body.userPassword
        ? await hashPassword(request.body.userPassword)
        : undefined,
    });
  } else {
    selectedUser.password = request.body.userPassword
      ? await hashPassword(request.body.userPassword)
      : undefined;
    selectedUser.canEditResource = request.body.canEditResource || false;
  }
  await selectedUser.save();

  return selectedUser;
}

function validateRequest(
  request: Request<{}, {}, TokenPayload>,
  response: Response
) {
  if (
    !request.body?.name ||
    (request.body?.name && request.body?.name.length < 1)
  ) {
    response.status(400);
    return response.send({ message: USER_ERROR_MESSAGES.NAME_MISSING });
  }
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

async function validateAdmin(request: Request<{}, {}, TokenPayload>) {
  const isAdminPasswordValid = await comparePasswords(
    request.body.password,
    process.env.ZHIVA_AUTH_ADMIN_PASSWORD || ""
  );

  if (!isAdminPasswordValid) {
    throw Error(USER_ERROR_MESSAGES.ADMIN_PASSWORD_INVALID);
  }

  return request;
}

export function generateTokenService(
  request: Request<{}, {}, TokenPayload>,
  response: Response
) {
  validateRequest(request, response);

  validateAdmin(request)
    .then(getUserFromRequest)
    .then(
      createAuthTokenGenerator({
        canEditResource: request.body.canEditResource,
      })
    )
    .then((newToken) => {
      response.send({ token: newToken });
    })
    .catch((error) => {
      console.error(error.message);
      if (Object.keys(USER_ERROR_CODES).includes(error.message)) {
        response.status(USER_ERROR_CODES[error.message]);
      } else {
        response.status(500);
      }
      if (Object.values(USER_ERROR_MESSAGES).includes(error.message)) {
        return response.send({ message: error.message });
      }

      response.send({ message: USER_ERROR_MESSAGES.OTHER_ERROR });
    });
}
