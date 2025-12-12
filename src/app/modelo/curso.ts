import { Alumno } from './alumno';
import { SoftSkill } from './softskill';

export interface Curso {
  id: number;
  nombreCorto: string;
  nombreLargo: string;
  nombreVisible: string;
  registradoSk: boolean;
  fechaAlta: string | null;
  profesor: {
    id: number;
  };
  alumnos: Alumno[];
  softSkills: SoftSkill[];
}
export { Alumno };

