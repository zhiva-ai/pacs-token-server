export const SERVER_URI = process.env.SERVER_URI || "https://localhost/auth";
export const PACS_URI = process.env.PACS_URI || "https://localhost/zhiva/pacs";
export enum PATHS {
  GENERATE_AUTH_TOKEN = "/generate-token",
  GENERATE_ACCESS_TOKEN = "/generate-access-token",
  REFRESH_TOKEN = "/refresh-token",
  API_SIGN_IN_USER = "/sign-user",
  NGINX_VERIFY_TOKEN = "/verify",
  PACS_AUTH_TOKEN = '/pacs-auth',
  PAGE_SING_IN_USER = "/sign-in",
  PAGE_GENERATE_AUTH_TOKEN = "/token",
}
export const ACCESS_TOKEN_EXPIRATION = "24h";
export const REFRESH_TOKEN_EXPIRATION = "30d";
