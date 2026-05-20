import { MuestraSKDetalle } from './muestra-sk';
import { SoftSkillCodeValue, TipoMedicionSoftSkill } from './softskill';

export interface CursoSoftSkillMuestrasResponse {
  cursoId: number;
  cursoNombre: string | null;
  alumnoId: number;
  alumnoNombre: string;
  softSkill: {
    id: number;
    codigo: SoftSkillCodeValue | null;
    nombre: string;
    descripcion: string | null;
    tipoMedicion?: TipoMedicionSoftSkill;
  };
  numMuestras: number;
  muestras: MuestraSKDetalle[];
}
