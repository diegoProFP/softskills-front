import { of } from 'rxjs';
import { CursosComponent } from './cursos.component';
import { Curso } from '../../modelo/curso';
import { CursoService } from '../../services/curso.service';
import { NotificationService } from '../../services/notification.service';

describe('CursosComponent', () => {
  let component: CursosComponent;
  let cursoService: jasmine.SpyObj<CursoService>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  const cursos: Curso[] = [
    {
      id: 1,
      nombre: '1_DAW_A_2526',
      nombreLargo: 'Primero de DAW',
      registradoSk: true,
      registrableEnSoftSkills: true,
      fechaAlta: '2026-04-01',
      profesor: { id: 10 },
      alumnos: [],
      softSkills: []
    },
    {
      id: 2,
      nombre: '2_DAW_A_2526',
      nombreLargo: 'Segundo de DAW',
      registradoSk: false,
      registrableEnSoftSkills: true,
      fechaAlta: '2026-04-02',
      profesor: { id: 11 },
      alumnos: [],
      softSkills: []
    },
    {
      id: 3,
      nombre: '1_DAM_B_2526',
      nombreLargo: 'Primero de DAM',
      registradoSk: false,
      registrableEnSoftSkills: false,
      fechaAlta: '2026-04-03',
      profesor: { id: 12 },
      alumnos: [],
      softSkills: []
    }
  ];

  beforeEach(() => {
    cursoService = jasmine.createSpyObj('CursoService', ['getCursos', 'registrarCurso']);
    notificationService = jasmine.createSpyObj('NotificationService', ['showSuccess', 'showHttpError', 'showWarning']);

    cursoService.getCursos.and.returnValue(of(cursos));
    cursoService.registrarCurso.and.returnValue(of('ok'));
    notificationService.showHttpError.and.callFake((error, fallback) => String(fallback ?? error));

    component = new CursosComponent(cursoService as never, notificationService as never);
  });

  it('should combine text search with the soft skills registrable filter', () => {
    component.ngOnInit();

    component.busquedaControl.setValue('daw');
    component.soloRegistrablesControl.setValue(true);

    expect(component.cursosRegistradosFiltrados.map((curso) => curso.id)).toEqual([1]);
    expect(component.cursosNoRegistradosFiltrados.map((curso) => curso.id)).toEqual([2]);
    expect(component.opcionesAutocompletado.map((curso) => curso.id)).toEqual([1, 2]);
  });

  it('should hide non registrable courses when the checkbox is active even without text', () => {
    component.ngOnInit();

    component.soloRegistrablesControl.setValue(true);

    expect(component.cursosRegistradosFiltrados.map((curso) => curso.id)).toEqual([1]);
    expect(component.cursosNoRegistradosFiltrados.map((curso) => curso.id)).toEqual([2]);
  });

  it('should disable registration for non registrable courses and avoid the request', () => {
    component.ngOnInit();

    component.registrarCurso(cursos[2]);

    expect(component.puedeRegistrarCurso(cursos[1])).toBeTrue();
    expect(component.puedeRegistrarCurso(cursos[2])).toBeFalse();
    expect(cursoService.registrarCurso).not.toHaveBeenCalled();
    expect(notificationService.showWarning).toHaveBeenCalledWith(component.avisoCursoNoRegistrable);
  });
});
