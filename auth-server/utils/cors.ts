import { CorsOptions } from "cors";

function wildcardTest(wildcard: string, str: string) {
  let w = wildcard.replace(/[.+^${}()|[\]\\]/g, "\\$&"); // regexp escape
  const re = new RegExp(`^${w.replace(/\*/g, ".*").replace(/\?/g, ".")}$`, "i");
  return re.test(str);
}

export function getCorsOptions(allowedOrigins: string[] = []): CorsOptions {
  const options: CorsOptions = {
    origin: function (origin, callback) {
      if (
        allowedOrigins.some((wildcard) => wildcardTest(wildcard, origin || "") || !origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: 'GET,HEAD,OPTIONS,POST',
    exposedHeaders: 'Authorization',
    optionsSuccessStatus: 204
  };

  return options;
}
