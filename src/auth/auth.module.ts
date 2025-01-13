import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config';
import { FirebaseModule } from './providers/firebase.module';
import { sagasProviders } from './sagas/sagas.providers';
import { NatsModule } from 'src/transports/nats.module';
import { S3Module } from './providers/s3.module';
import { UploadS3Controller } from './UploadS3/upload-s3.controller';
import { UploadS3Service } from './UploadS3/upload-s3.service';

@Module({
  imports: [
    FirebaseModule,
    S3Module,
    JwtModule.register({
      global: true,
      secret: envs.jwtSecret,
      signOptions: { expiresIn: '1h' },
    }),
    NatsModule,
  ],
  exports: [AuthService],
  controllers: [AuthController, UploadS3Controller],
  providers: [AuthService, UploadS3Service, ...sagasProviders],
})
export class AuthModule {}
