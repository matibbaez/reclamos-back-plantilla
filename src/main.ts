import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. HELMET (Desactivado por ahora para evitar conflictos)
  // app.use(helmet()); 

  // 2. CORS: LA CONFIGURACIÓN DEFINITIVA
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'http://localhost:3000',
      // ESTA LÍNEA ES LA MAGIA: Acepta cualquier subdominio de vercel.app
      /^https:\/\/.*\.vercel\.app$/,
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization,X-Requested-With,Accept',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // 3. VALIDACIÓN
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, 
    forbidNonWhitelisted: true, 
  }));

  // 4. DOCUMENTACIÓN: Swagger disponible en /api/docs
  const config = new DocumentBuilder()
    .setTitle('API Reclamarte')
    .setDescription('Documentación de la API para gestión de reclamos')
    .setVersion('1.0')
    .addBearerAuth() // Botón para probar con Token JWT
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); 

  // 5. SCRIPT DE SIEMBRA: Crea el usuario Admin si no existe
  const usersService = app.get(UsersService);
  const adminEmail = 'admin@estudio.com'; 
  const adminUser = await usersService.findOneByEmail(adminEmail);

  if (!adminUser) {
    console.log('⚠️ Admin no encontrado. Creando usuario admin inicial...');
    await usersService.create({
      email: adminEmail,
      nombre: 'Admin Estudio',
      password: 'PasswordSeguro123!',
    });
    console.log('✅ ¡Usuario admin creado con éxito!');
  } else {
    console.log('✅ El usuario admin ya existe.');
  }

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 API corriendo en el puerto ${port}`);
  console.log(`📄 Documentación Swagger: http://localhost:3000/api/docs`);
}
bootstrap();