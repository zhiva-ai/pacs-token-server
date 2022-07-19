import { generateToken } from "../../utils/jwt";
import { Token } from "../../db/schemas/token";
import {
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
} from "../../utils/constants";

export function createAccessTokenGenerator(origin?: string) {
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

    const newRefreshToken = generateToken(
      {
        name: user.name,
        username: user.username,
        canEditResource: Boolean(user.canEditResource),
        aud: origin,
      },
      {
        expiresIn: REFRESH_TOKEN_EXPIRATION,
      }
    );

    const refreshToken = new Token({
      type: "refresh",
      token: newRefreshToken,
    });

    await refreshToken.save();

    user.authToken = null;
    user.accessTokens.push(accessToken._id);
    user.refreshTokens.push(refreshToken._id);
    await user.save();

    return {
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
    };
  };
}
