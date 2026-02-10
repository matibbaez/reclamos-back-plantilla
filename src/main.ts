import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. SEGURIDAD: Helmet protege tu app de vulnerabilidades web conocidas
  app.use(helmet()); 
  
  // 2. CORS: Permite que el frontend (en otro dominio) se comunique con esta API
  app.enableCors({
    origin: '*', // <--- Acepta conexiones desde cualquier lado
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 3. VALIDACIÓN: Limpieza automática de datos entrantes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Elimina campos que no estén en los DTO
    forbidNonWhitelisted: true, // Tira error si envían datos extra
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