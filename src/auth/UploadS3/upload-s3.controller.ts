import {
  Controller,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UploadS3Service } from './upload-s3.service';

@Controller()
export class UploadS3Controller {
  constructor(private readonly uploadS3service: UploadS3Service) {}

  @MessagePattern('uploadProfileImage')
  async uploadImage(@Payload() data: any) {
    console.log('uploadProfileImage');
    const { userId, file } = data;
    console.log('data:', data);
    return this.uploadS3service.uploadFile(file, userId);
  }
}
