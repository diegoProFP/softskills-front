import { NivelMuestraSoftSkill } from './softskill';

export interface MuestraSK {
  profesorId: number;
  cursoId: number;
  alumnoId: number;
  softSkillId: number;
  motivoId?: number;
  valor?: number; // 1 para positivo, -1 para negativo. Fallback legacy si no hay motivo enriquecido.
  nivel?: NivelMuestraSoftSkill;
  motivo?: string | null;
  motivoComentario?: string | null;
}

export interface MuestraSKUpdate {
  cursoId: number;
  alumnoId: number;
  softSkillId: number;
  motivoId?: number;
  valor?: number;
  nivel?: NivelMuestraSoftSkill;
  motivo?: string | null;
  motivoComentario?: string | null;
}

export interface MuestraSKDetalle {
  id: number;
  fecha: string;
  valor: number;
  nivel: NivelMuestraSoftSkill | string | null;
  pesoNivel: number | null;
  motivoId: number | null;
  motivo: string | null;
  motivoComentario: string | null;
  profesorId: number | null;
  editable: boolean;
  deletable: boolean;
}

export interface MuestraSKTotalActualizado {
  alumnoId: number;
  softSkillId: number;
  puntuacionTotal: number;
  numMuestras: number;
}

export interface MuestraSKUpdateResponse {
  muestra: MuestraSKDetalle;
  totalActualizado: MuestraSKTotalActualizado;
}

export interface MuestraSKDeleteResponse {
  deleted: boolean;
  muestraId: number;
  cursoId: number;
  alumnoId: number;
  softSkillId: number;
  totalActualizado: MuestraSKTotalActualizado;
}
