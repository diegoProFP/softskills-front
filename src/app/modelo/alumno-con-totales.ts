import { SoftSkillTotalDTO } from './softskill-total';

export interface AlumnoConTotales {
  id: number;
  nombre: string;
  totalesPorSkill: SoftSkillTotalDTO[];
}
