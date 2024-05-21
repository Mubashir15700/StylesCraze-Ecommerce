import dotenv from "dotenv";
import Joi from "joi";

dotenv.config();

const envVarsSchema = Joi.object({
    NODE_ENV: Joi.string().valid("development", "production", "test").required(),
    PORT: Joi.number().default(3000),
    DB_LOCAL_URL: Joi.string().required(),
    SECRET: Joi.string().required(),
    APP_EMAIL: Joi.string().required(),
    APP_PASSWORD: Joi.string().required(),
    RAZORPAY_ID_KEY: Joi.string().required(),
    RAZORPAY_SECRET_KEY: Joi.string().required(),
}).unknown().required();

const { error, value: envVars } = envVarsSchema.validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    dbLocalUrl: envVars.DB_LOCAL_URL,
    secret: envVars.SECRET,
    appEmail: envVars.APP_EMAIL,
    appPassword: envVars.APP_PASSWORD,
    razorpayIdKey: envVars.RAZORPAY_ID_KEY,
    razorpaySecretKey: envVars.RAZORPAY_SECRET_KEY,
};
