import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
import { ARCJET_KEY, NODE_ENV } from "./env.js";

// Use DRY_RUN mode in development for safe testing
const mode = NODE_ENV === "production" ? "LIVE" : "DRY_RUN";

const aj = arcjet({
  key: ARCJET_KEY,
  rules: [
    shield({ mode }),
    ...(NODE_ENV === "production"
      ? [
          detectBot({
            mode,
            allow: ["CATEGORY:SEARCH_ENGINE"],
          }),
        ]
      : []),
    tokenBucket({
      mode,
      refillRate: 5,
      interval: 10,
      capacity: 10,
    }),
  ],
});

export default aj;
