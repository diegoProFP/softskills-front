import { Alumno } from './alumno';
import { SoftSkill } from './softskill';

export interface Curso {
  id: number;
  nombre: string;
  nombreLargo: string;
  registradoSk: boolean;
  registrableEnSoftSkills: boolean;
  fechaAlta: string | null;
  profesor: {
    id: number;
  };
  alumnos: Alumno[];
  softSkills: SoftSkill[];
}
export { Alumno };

