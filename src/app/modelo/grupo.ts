export interface Grupo {
  id: number;
  nivel: string;
  cicloFormativo: string;
  grupo: string;
  cursoEscolar: string;
  cursoMoodleGrupoId?: number | null;
}

export interface AdminGrupoAcademico extends Grupo {
  cursoMoodleGrupoId: number | null;
}

export interface AdminGrupoAcademicoUpdate {
  cursoMoodleGrupoId: number | null;
}
