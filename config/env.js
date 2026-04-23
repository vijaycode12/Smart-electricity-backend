import { config } from "dotenv";

config({path:`.env.${process.env.NODE_ENV || 'development'}.local`});

export const{
    PORT,
    NODE_ENV,
    BACKEND_URL,
    DB_URL,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    ARCJET_ENV,
    ARCJET_KEY
} = process.env;