import {
  cleanEnv, port, str,
} from 'envalid';

export function validateEnv() {
  cleanEnv(process.env, {
    ZHIVA_MONGO_PATH: str(),
    ZHIVA_MONGO_USER: str(),
    ZHIVA_MONGO_PASSWORD: str(),
    ZHIVA_AUTH_PORT: port(),
  });
}