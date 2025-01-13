import { Module } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { AWS_S3, envs } from 'src/config';

@Module({
  providers: [
    {
      provide: AWS_S3,
      useFactory: () => {
        return new S3Client({
          region: envs.aws_region,
          credentials: {
            accessKeyId: envs.aws_accessKeyId,
            secretAccessKey: envs.aws_secretAccessKey,
          },
          forcePathStyle: true,
        });
      },
    },
  ],
  exports: [AWS_S3],
})
export class S3Module {}
