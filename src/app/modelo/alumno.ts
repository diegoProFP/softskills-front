import { SoftSkillTotalDTO } from './softskill-total';

export interface Alumno {
  id: number;
  nombre: string;
  username: string | null;
  email: string;
  totalesPorSkill?: SoftSkillTotalDTO[];
}
