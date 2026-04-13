import { SoftSkillTotalDTO } from './softskill-total';

export interface AlumnoConTotales {
  id: number;
  nombre: string;
  rankingScore?: number | null;
  posicionRanking?: number | null;
  numMuestrasTotales?: number | null;
  totalesPorSkill: SoftSkillTotalDTO[];
}
