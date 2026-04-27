import { NivelMuestraSoftSkill, SoftSkillCodeValue, TipoMedicionSoftSkill } from './softskill';

export interface AlumnoSoftSkillMuestraDetalle {
  id: number;
  fecha: string;
  valor: number;
  nivel: NivelMuestraSoftSkill | string | null;
  pesoNivel: number | null;
  motivo: string | null;
  profesorId: number | null;
}

export interface AlumnoSoftSkillCursoDetalle {
  cursoId: number;
  cursoNombre: string | null;
  numMuestras: number;
  muestras: AlumnoSoftSkillMuestraDetalle[];
}

export interface AlumnoSoftSkillMuestrasResponse {
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
  cursos: AlumnoSoftSkillCursoDetalle[];
}

export function sortAlumnoSoftSkillCursos(
  cursos: AlumnoSoftSkillCursoDetalle[] | null | undefined
): AlumnoSoftSkillCursoDetalle[] {
  return [...(cursos ?? [])].map((curso) => ({
    ...curso,
    muestras: [...(curso.muestras ?? [])].sort((a, b) => b.fecha.localeCompare(a.fecha))
  }));
}
