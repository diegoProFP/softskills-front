import { SoftSkillTotalDTO } from './softskill-total';

export interface Alumno {
  id: number;
  nombre: string;
  apellidos?: string | null;
  nombreCompleto?: string | null;
  username: string | null;
  email: string;
  totalesPorSkill?: SoftSkillTotalDTO[];
}
