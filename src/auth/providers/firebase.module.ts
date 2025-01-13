import { Module } from '@nestjs/common';
import { envs, FIREBASE_APP } from 'src/config';
import * as admin from 'firebase-admin';

@Module({
  providers: [
    {
      provide: FIREBASE_APP, // Token único para inyección
      useFactory: () => {
        const firebaseConfig = {
          type: envs.firebase_type,
          project_id: envs.firebase_projectId,
          private_key_id: envs.firebase_privateKeyId,
          private_key: envs.firebase_privateKey,
          client_email: envs.firebase_clientEmail,
          client_id: envs.firebase_clientId,
          auth_uri: envs.firebase_authUri,
          token_uri: envs.firebase_tokenUri,
          auth_provider_x509_cert_url: envs.firebase_authProviderX509CertUrl,
          client_x509_cert_url: envs.firebase_clientX509CertUrl,
          universe_domain: envs.firebase_universeDomain,
        } as admin.ServiceAccount;

        return admin.initializeApp({
          credential: admin.credential.cert(firebaseConfig),
        });
      },
    },
  ],
  exports: [FIREBASE_APP],
})
export class FirebaseModule {}
