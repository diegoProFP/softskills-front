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
