import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReclamosModule } from './reclamos/reclamos.module';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';
import { Reclamo } from './reclamos/entities/reclamo.entity';
import { User } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        // 1. BASE DE DATOS
        DATABASE_URL: Joi.string().required(), // Ahora es requerida para conectar TypeORM
        
        // 2. SUPABASE (Auth + Storage)
        SUPABASE_URL: Joi.string().required(),
        SUPABASE_KEY: Joi.string().required(),     // Service Role Key para el Back
        SUPABASE_BUCKET: Joi.string().required(),  // Nombre del bucket (ej: 'documentos')

        // 3. SEGURIDAD
        JWT_SECRET: Joi.string().required(),

        // 4. OTROS (Opcionales o Defaults)
        PORT: Joi.number().default(3000),
      }),
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        
        return {
            type: 'postgres',
            url: databaseUrl,
            entities: [Reclamo, User],
            synchronize: true, // Ojo: En demo está bien true, en prod real mejor false + migraciones
            autoLoadEntities: true,
            // Configuración SSL necesaria para Render + Supabase Transaction Pooler
            ssl: { rejectUnauthorized: false }, 
        };
      },
    }),

    ReclamosModule,
    StorageModule,
    UsersModule,
    AuthModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}