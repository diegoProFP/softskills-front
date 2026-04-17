import { SoftSkill, SoftSkillCodeValue, TipoMedicionSoftSkill } from './softskill';

export interface SoftSkillTotalDTO {
  id: number;
  codigo: SoftSkillCodeValue | null;
  nombre: string;
  descripcion: string | null;
  puntuacionTotal: number;
  tipoMedicion?: TipoMedicionSoftSkill;
}

type SoftSkillIdentity = Pick<SoftSkillTotalDTO, 'id' | 'codigo' | 'nombre'>
  | Pick<SoftSkill, 'id' | 'codigo' | 'nombre'>;

export function getSoftSkillLookupKey(skill: SoftSkillIdentity): string {
  if (skill.codigo) {
    return `codigo:${skill.codigo}`;
  }

  if (typeof skill.id === 'number') {
    return `id:${skill.id}`;
  }

  return `nombre:${skill.nombre.trim().toLocaleLowerCase()}`;
}

export function indexSoftSkillsByCodigo<T extends { codigo?: SoftSkillCodeValue | null }>(
  softSkills: T[] | null | undefined
): Record<string, T> {
  return (softSkills ?? []).reduce<Record<string, T>>((index, softSkill) => {
    if (softSkill.codigo) {
      index[softSkill.codigo] = softSkill;
    }

    return index;
  }, {});
}

export function indexSoftSkillsByKey<T extends SoftSkillIdentity>(
  softSkills: T[] | null | undefined
): Record<string, T> {
  return (softSkills ?? []).reduce<Record<string, T>>((index, softSkill) => {
    index[getSoftSkillLookupKey(softSkill)] = softSkill;
    return index;
  }, {});
}

export function getSoftSkillTotalByCodigo(
  softSkills: SoftSkillTotalDTO[] | null | undefined,
  codigo: SoftSkillCodeValue | null | undefined
): SoftSkillTotalDTO | undefined {
  if (!codigo) {
    return undefined;
  }

  return indexSoftSkillsByCodigo(softSkills)[codigo];
}

export function getSoftSkillTotalByKey(
  softSkills: SoftSkillTotalDTO[] | null | undefined,
  key: string
): SoftSkillTotalDTO | undefined {
  return indexSoftSkillsByKey(softSkills)[key];
}

export function sortSoftSkillsByNombre<T extends { nombre: string }>(
  softSkills: T[] | null | undefined
): T[] {
  return [...(softSkills ?? [])].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
  );
}
