import { Request, Response } from "express";
import { TOKEN_ERROR_MESSAGES, trimJWT, validateToken } from "../utils/jwt";
import { User } from "../db/schemas/user";
import { Token } from "../db/schemas/token";

type AccessObj = {
  granted: boolean;
  validity?: number;
};

type OrthancRequestBody = {
  "dicom-uid"?: string;
  level: "patient" | "study" | "series" | "instance";
  method: "get" | "post" | "put" | "delete";
  "orthanc-id"?: string;
  "token-key": string;
  "token-value": string;
  uri: string;
};

async function validateAccessToken(
  authorizationHeader: string, requestBody: OrthancRequestBody
): Promise<AccessObj> {
  let token = trimJWT(authorizationHeader);

  const tokenPayload = await validateToken(token);

  // Check if auth token didn't expire
  if (Number(tokenPayload.exp) < Math.floor(Date.now() / 1000)) {
    throw Error(TOKEN_ERROR_MESSAGES.EXPIRED_TOKEN);
  }

  if(!tokenPayload.canEditResource && requestBody.method !== 'get') {
    throw Error(TOKEN_ERROR_MESSAGES.UNAUTHORIZED_TOKEN);
  }

  let selectedToken = await Token.findOne({
    type: "access",
    token: token,
  });

  let selectedUser = await User.findOne({
    username: tokenPayload.username,
    $or: [
      {
        authToken: token,
      },
      {
        accessTokens: [selectedToken ? selectedToken._id.valueOf() : null],
      },
    ],
  });

  // Check if auth token exists in DB
  if (!selectedUser) {
    throw Error(TOKEN_ERROR_MESSAGES.INVALID_TOKEN);
  }

  return {
    granted: true,
    validity: 5,
  };
}

export function pacsAuthService(
  request: Request<{}, {}, OrthancRequestBody>,
  response: Response<AccessObj>
) {
  if (request.method == "POST") {
    validateAccessToken(request.body["token-value"], request.body)
      .then((accessObj) => {
        response.status(200);
        response.send(accessObj);
      })
      .catch((e) => {
        console.error(e);
        response.status(200);
        response.send({
          granted: false,
          validity: 0,
        });
      });
  } else {
    response.status(405);
    return response.send();
  }
}
