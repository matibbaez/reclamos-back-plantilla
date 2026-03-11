// E:\estudio-plantilla\estudio-api\src\reclamos\entities\reclamo.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('reclamos')
export class Reclamo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  dni: string;

  @Column()
  email: string;

  // --- AGREGÁ ESTA COLUMNA ---
  @Column({ nullable: true }) // <--- Cambialo a esto temporalmente
  telefono: string;

  @Column({ unique: true })
  codigo_seguimiento: string;

  @Column({ default: 'Recibido' })
  estado: string; 

  @CreateDateColumn()
  fecha_creacion: Date;

  @Column() 
  path_dni: string;

  @Column({ nullable: true })
  path_recibo: string;

  @Column({ nullable: true })
  path_form1: string;

  @Column({ nullable: true })
  path_form2: string;
  
  @Column({ nullable: true }) 
  path_alta_medica: string;

  @Column({ nullable: true }) 
  tipo_tramite: string; 

  @Column({ nullable: true }) 
  subtipo_tramite: string;

  @Column({ nullable: true })
  jornada_laboral: string;

  @Column({ nullable: true })
  direccion_laboral: string;

  @Column({ nullable: true })
  trayecto_habitual: string;

  @Column({ nullable: true }) 
  path_carta_documento: string;

  @Column({ nullable: true }) 
  path_revoca_patrocinio: string;
  
  @Column({ default: false })
  tiene_abogado_anterior: boolean;
}