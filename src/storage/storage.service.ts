import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private supabase: SupabaseClient;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = configService.get<string>('SUPABASE_URL');
    const supabaseKey = configService.get<string>('SUPABASE_KEY'); // Usar Service Role Key en backend
    this.bucketName = configService.get<string>('SUPABASE_BUCKET')!;

    // Validación rápida
    if (!supabaseUrl || !supabaseKey || !this.bucketName) {
      throw new Error('Error: Faltan variables de entorno de Supabase (SUPABASE_URL, SUPABASE_KEY o SUPABASE_BUCKET)');
    }

    // Inicializamos el cliente
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }, // No necesitamos sesión de usuario en el back
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
    fileName: string,
  ): Promise<string> {
    // Ruta final: "dni/12345.pdf"
    const path = `${folder}/${fileName}`;

    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(path, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) {
        throw new Error(error.message);
      }

      // Retornamos el path para guardarlo en la DB (igual que antes)
      return path; 
    } catch (error) {
      console.error('Error subiendo archivo a Supabase:', error);
      throw new InternalServerErrorException(`No se pudo subir el archivo: ${error.message}`);
    }
  }

  async createSignedUrl(filePath: string): Promise<string> {
    try {
      // Generamos URL firmada válida por 1 hora (3600 seg)
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .createSignedUrl(filePath, 3600);

      if (error) {
        throw new Error(error.message);
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Error generando URL firmada Supabase:', error);
      throw new InternalServerErrorException('Error al generar el link de descarga');
    }
  }
}