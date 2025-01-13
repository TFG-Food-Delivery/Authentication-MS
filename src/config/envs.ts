import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  NATS_SERVERS: string[];
  JWT_SECRET: string;
  LEADER_DATABASE_URL: string;
  // FOLLOWER1_DATABASE_URL: string;
  // FOLLOWER2_DATABASE_URL: string;
  FIREBASE_TYPE: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_PRIVATE_KEY_ID: string;
  FIREBASE_PRIVATE_KEY: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_CLIENT_ID: string;
  FIREBASE_AUTH_URI: string;
  FIREBASE_TOKEN_URI: string;
  FIREBASE_AUTH_PROVIDER_X509_CERT_URL: string;
  FIREBASE_CLIENT_X509_CERT_URL: string;
  FIREBASE_UNIVERSE_DOMAIN: string;
  AWS_REGION: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_S3_BUCKET_NAME: string;
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
    JWT_SECRET: joi.string().required(),
    LEADER_DATABASE_URL: joi.string().required(),
    // FOLLOWER1_DATABASE_URL: joi.string().required(),
    // FOLLOWER2_DATABASE_URL: joi.string().required(),
    FIREBASE_TYPE: joi.string().required(),
    FIREBASE_PROJECT_ID: joi.string().required(),
    FIREBASE_PRIVATE_KEY_ID: joi.string().required(),
    FIREBASE_PRIVATE_KEY: joi.string().required(),
    FIREBASE_CLIENT_EMAIL: joi.string().required(),
    FIREBASE_CLIENT_ID: joi.string().required(),
    FIREBASE_AUTH_URI: joi.string().required(),
    FIREBASE_TOKEN_URI: joi.string().required(),
    FIREBASE_AUTH_PROVIDER_X509_CERT_URL: joi.string().required(),
    FIREBASE_CLIENT_X509_CERT_URL: joi.string().required(),
    FIREBASE_UNIVERSE_DOMAIN: joi.string().required(),
    AWS_REGION: joi.string().required(),
    AWS_ACCESS_KEY_ID: joi.string().required(),
    AWS_SECRET_ACCESS_KEY: joi.string().required(),
    AWS_S3_BUCKET_NAME: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS.split(','),
});

if (error) {
  throw new Error(`Config validation error: ${error}.message`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  natsServers: envVars.NATS_SERVERS,
  jwtSecret: envVars.JWT_SECRET,
  leaderDatabaseUrl: envVars.LEADER_DATABASE_URL,
  // follower1DatabaseUrl: envVars.FOLLOWER1_DATABASE_URL,
  // follower2DatabaseUrl: envVars.FOLLOWER2_DATABASE_URL,
  firebase_type: envVars.FIREBASE_TYPE,
  firebase_projectId: envVars.FIREBASE_PROJECT_ID,
  firebase_privateKeyId: envVars.FIREBASE_PRIVATE_KEY_ID,
  firebase_privateKey: envVars.FIREBASE_PRIVATE_KEY,
  firebase_clientEmail: envVars.FIREBASE_CLIENT_EMAIL,
  firebase_clientId: envVars.FIREBASE_CLIENT_ID,
  firebase_authUri: envVars.FIREBASE_AUTH_URI,
  firebase_tokenUri: envVars.FIREBASE_TOKEN_URI,
  firebase_authProviderX509CertUrl:
    envVars.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  firebase_clientX509CertUrl: envVars.FIREBASE_CLIENT_X509_CERT_URL,
  firebase_universeDomain: envVars.FIREBASE_UNIVERSE_DOMAIN,
  aws_region: envVars.AWS_REGION,
  aws_accessKeyId: envVars.AWS_ACCESS_KEY_ID,
  aws_secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
  aws_s3_bucketName: envVars.AWS_S3_BUCKET_NAME,
};
