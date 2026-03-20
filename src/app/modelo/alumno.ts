export interface Alumno {
  id: number;
  nombre: string;
  username: string | null;
  email: string;
  totalesPorSkill?: Record<string, number>;
}
