import express, { Request, Response } from "express";
import cors from "cors";
import * as path from "path";
import "dotenv/config";
import { validateEnv } from "./utils/validateEnv";
import { generateTokenService } from "./services/generateTokenService";
import connectDB from "./db/dbService";
import { generateAccessTokenService } from "./services/generateAccessTokenService";
import { refreshTokenService } from "./services/refreshAccessTokenService";
import { signInUserService } from "./services/signInUserService";
import { PATHS } from "./utils/constants";
import { getCorsOptions } from "./utils/cors";
import {pacsAuthService} from "./services/pacsAuthService";
import {verifyTokenService} from "./services/verifyTokenService";

const {
  ZHIVA_AUTH_PORT = 4000,
  ZHIVA_MONGO_USER,
  ZHIVA_MONGO_PASSWORD,
  ZHIVA_MONGO_DATABASE,
  ZHIVA_MONGO_PATH,
  ZHIVA_AUTH_ALLOWED_ORIGINS = "",
} = process.env;

validateEnv();

const allowedOrigins = [
  ...ZHIVA_AUTH_ALLOWED_ORIGINS.split(","),
  "https://*.zhiva.ai",
  "https://localhost",
];

const app = express();
app.use(cors<Request>(getCorsOptions(allowedOrigins)));
app.use(express.json());

connectDB(
  `mongodb://${ZHIVA_MONGO_USER}:${ZHIVA_MONGO_PASSWORD}@${ZHIVA_MONGO_PATH}/${ZHIVA_MONGO_DATABASE}`
);

// API
app.options(PATHS.GENERATE_AUTH_TOKEN, cors<Request>(getCorsOptions(allowedOrigins)))
app.post(PATHS.GENERATE_AUTH_TOKEN, generateTokenService);

app.options(PATHS.GENERATE_ACCESS_TOKEN, cors<Request>(getCorsOptions(allowedOrigins)))
app.post(PATHS.GENERATE_ACCESS_TOKEN, generateAccessTokenService);

app.options(PATHS.REFRESH_TOKEN, cors<Request>(getCorsOptions(allowedOrigins)))
app.post(PATHS.REFRESH_TOKEN, refreshTokenService);

app.options(PATHS.API_SIGN_IN_USER, cors<Request>(getCorsOptions(allowedOrigins)))
app.post(PATHS.API_SIGN_IN_USER, signInUserService);

app.post(PATHS.PACS_AUTH_TOKEN, pacsAuthService);

// Pages
app.get(PATHS.PAGE_GENERATE_AUTH_TOKEN, (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "/pages/generateTokenPage.html"));
});

app.get(PATHS.PAGE_SING_IN_USER, (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "/pages/basicLoginPage.html"));
});

app.get(PATHS.NGINX_VERIFY_TOKEN, verifyTokenService);

app.listen(ZHIVA_AUTH_PORT, () => {
  console.log(
    `App listening at http://auth-server:${ZHIVA_AUTH_PORT} in docker`
  );
});
