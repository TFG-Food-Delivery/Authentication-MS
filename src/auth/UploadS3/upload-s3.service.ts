import { Inject, Injectable, Logger, Req, Res } from '@nestjs/common';

import { AWS_S3, envs } from 'src/config';

import { RpcException } from '@nestjs/microservices';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class UploadS3Service {
  private readonly LOGGER = new Logger('UploadS3Service');
  constructor(@Inject(AWS_S3) private readonly aws_s3: S3Client) {}

  async uploadFile(file: any, userId: string) {
    if (!userId) {
      throw new RpcException({
        statusCode: 400,
        message: 'User ID is required',
      });
    }

    try {
      const fileKey = `profile-images/${userId}_profile-image`;
      const buffer = Buffer.from(file.buffer, 'base64');
      const command = new PutObjectCommand({
        Bucket: envs.aws_s3_bucketName,
        Key: fileKey,
        Body: buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
        },
      });

      const uploadResult = await this.aws_s3.send(command);

      this.LOGGER.debug('uploadResult:', uploadResult);
      return {
        url: this.getFileUrl(fileKey).url,
        fileKey,
      };
    } catch (error) {}
  }

  getFileUrl(key: string) {
    return {
      url: `https://${envs.aws_s3_bucketName}.s3.${envs.aws_region}.amazonaws.com/${key}`,
    };
  }
}
