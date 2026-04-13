export enum SoftSkillCode {
  GENERICA = 'GENERICA',
  ENFOQUE_DISTRACCIONES = 'ENFOQUE_DISTRACCIONES',
  PARTICIPACION = 'PARTICIPACION',
  TRABAJO_EN_EQUIPO = 'TRABAJO_EN_EQUIPO',
  COMUNICACION = 'COMUNICACION',
  AUTONOMIA = 'AUTONOMIA',
  RESPONSABILIDAD = 'RESPONSABILIDAD',
  GESTION_EMOCIONAL = 'GESTION_EMOCIONAL',
  RESOLUCION_DE_PROBLEMAS = 'RESOLUCION_DE_PROBLEMAS',
  RESPETO = 'RESPETO'
}

export type SoftSkillCodeValue = SoftSkillCode | string;

export interface SoftSkill {
  id: number;
  nombre: string;
  codigo?: SoftSkillCodeValue | null;
  descripcion: string;
  tipo: number; // 1 para valoraciÃ³n positiva/negativa
}
