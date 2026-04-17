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
  RESPETO = 'RESPETO',
  PUNTUALIDAD = 'PUNTUALIDAD',
}

export type SoftSkillCodeValue = SoftSkillCode | string;

export type TipoMedicionSoftSkill =
  | 'PENALIZACION_POR_TRAMOS'
  | 'ACUMULACION_SATURADA';

export type NivelMuestraSoftSkill =
  | 'LEVE'
  | 'NORMAL'
  | 'SIGNIFICATIVA';

export interface MotivoSoftSkill {
  motivo: string;
}

export interface SoftSkill {
  id: number;
  nombre: string;
  codigo?: SoftSkillCodeValue | null;
  descripcion: string;
  tipo: number; // Legacy: no usar para decidir la medicion.
  tipoMedicion?: TipoMedicionSoftSkill;
  listaMotivos?: MotivoSoftSkill[] | null;
}
