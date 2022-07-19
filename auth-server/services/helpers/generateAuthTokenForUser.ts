import { generateToken } from "../../utils/jwt";
import { PACS_URI, PATHS, SERVER_URI } from "../../utils/constants";

export function createAuthTokenGenerator({
  origin,
  canEditResource,
}: {
  origin?: string;
  canEditResource?: boolean;
} = {}) {
  return async function generateAuthTokenForUser(user: any) {
    const newToken = generateToken({
      name: user.name,
      username: user.username,
      canEditResource: (canEditResource ? canEditResource : user.canEditResource) || false,
      tokenServer: `${SERVER_URI}${PATHS.GENERATE_ACCESS_TOKEN}`,
      refreshServer: `${SERVER_URI}${PATHS.REFRESH_TOKEN}`,
      pacs: PACS_URI,
      aud: origin,
    });

    user.authToken = newToken;
    await user.save();

    return newToken;
  };
}
