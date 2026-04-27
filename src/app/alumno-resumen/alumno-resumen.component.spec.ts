import { convertToParamMap, ParamMap, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, of, throwError } from 'rxjs';
import { AlumnoResumenComponent } from './alumno-resumen.component';
import { AlumnoConTotales } from '../modelo/alumno-con-totales';
import { AlumnoSoftSkillMuestrasResponse } from '../modelo/alumno-soft-skill-muestras';
import { SoftSkillTotalDTO } from '../modelo/softskill-total';

class ActivatedRouteStub {
  private readonly paramMapSubject = new BehaviorSubject<ParamMap>(convertToParamMap({ alumnoId: '25' }));
  private readonly queryParamMapSubject = new BehaviorSubject<ParamMap>(convertToParamMap({}));

  snapshot = {
    paramMap: this.paramMapSubject.value,
    queryParamMap: this.queryParamMapSubject.value
  };

  readonly paramMap = this.paramMapSubject.asObservable();
  readonly queryParamMap = this.queryParamMapSubject.asObservable();

  setAlumnoId(alumnoId: string): void {
    const paramMap = convertToParamMap({ alumnoId });
    this.snapshot = {
      ...this.snapshot,
      paramMap
    };
    this.paramMapSubject.next(paramMap);
  }
}

describe('AlumnoResumenComponent', () => {
  let component: AlumnoResumenComponent;
  let route: ActivatedRouteStub;
  let alumnoService: jasmine.SpyObj<{
    getResumenById: (alumnoId: string) => Observable<AlumnoConTotales>;
    getSoftSkillMuestrasByAlumnoId: (alumnoId: string, softSkillId: number) => Observable<AlumnoSoftSkillMuestrasResponse>;
  }>;
  let authService: jasmine.SpyObj<{
    setPortalMode: (mode: string) => void;
    setStudentPortalUrl: (url: string) => void;
    logout: () => Observable<void>;
    clearSession: () => void;
  }>;
  let notificationService: jasmine.SpyObj<{
    showHttpError: (error: unknown, fallback?: string) => string;
    getErrorMessage: (error: unknown, fallback?: string) => string;
  }>;

  const skill: SoftSkillTotalDTO = {
    id: 1,
    codigo: 'ENFOQUE_DISTRACCIONES',
    nombre: 'Enfoque y concentracion',
    descripcion: 'Descripcion',
    puntuacionTotal: 4,
    tipoMedicion: 'PENALIZACION_POR_TRAMOS'
  };

  const resumen: AlumnoConTotales = {
    id: 25,
    nombre: 'Ana Perez',
    rankingScore: 7.5,
    posicionRanking: 2,
    numMuestrasTotales: 9,
    totalesPorSkill: [skill]
  };

  beforeEach(() => {
    route = new ActivatedRouteStub();

    alumnoService = jasmine.createSpyObj('AlumnoService', ['getResumenById', 'getSoftSkillMuestrasByAlumnoId']);
    authService = jasmine.createSpyObj('AuthService', ['setPortalMode', 'setStudentPortalUrl', 'logout', 'clearSession']);
    notificationService = jasmine.createSpyObj('NotificationService', ['showHttpError', 'getErrorMessage']);

    alumnoService.getResumenById.and.returnValue(of(resumen));
    notificationService.showHttpError.and.callFake((error, fallback) => String(fallback ?? error));
    notificationService.getErrorMessage.and.callFake((error, fallback) => String(fallback ?? error));

    component = new AlumnoResumenComponent(
      route as never,
      { url: '/alumnos/25/resumen', navigate: jasmine.createSpy('navigate') } as unknown as Router,
      alumnoService as never,
      authService as never,
      notificationService as never
    );
  });

  it('should load detail only once and reuse cached data while the same student is active', () => {
    const detailSubject = new Subject<AlumnoSoftSkillMuestrasResponse>();
    alumnoService.getSoftSkillMuestrasByAlumnoId.and.returnValue(detailSubject.asObservable());

    component.ngOnInit();

    component.toggleSoftSkillDetail(skill);
    component.toggleSoftSkillDetail(skill);
    component.toggleSoftSkillDetail(skill);

    expect(alumnoService.getResumenById).toHaveBeenCalledWith('25');
    expect(alumnoService.getSoftSkillMuestrasByAlumnoId).toHaveBeenCalledTimes(1);
    expect(alumnoService.getSoftSkillMuestrasByAlumnoId).toHaveBeenCalledWith('25', 1);
    expect(component.getSoftSkillDetailState(skill).status).toBe('loading');

    detailSubject.next({
      alumnoId: 25,
      alumnoNombre: 'Ana Perez',
      softSkill: {
        id: 1,
        codigo: 'ENFOQUE_DISTRACCIONES',
        nombre: 'Enfoque y concentracion',
        descripcion: 'Descripcion',
        tipoMedicion: 'PENALIZACION_POR_TRAMOS'
      },
      numMuestras: 2,
      cursos: [
        {
          cursoId: 101,
          cursoNombre: null,
          numMuestras: 2,
          muestras: [
            {
              id: 2,
              fecha: '2026-04-20T09:30:00',
              valor: -1,
              nivel: 'NORMAL',
              pesoNivel: 1,
              motivo: '',
              profesorId: 7
            },
            {
              id: 1,
              fecha: '2026-04-21T09:30:00',
              valor: 1,
              nivel: 'LEVE',
              pesoNivel: 0.5,
              motivo: 'Observacion',
              profesorId: 7
            }
          ]
        }
      ]
    });
    detailSubject.complete();

    expect(component.getSoftSkillDetailState(skill).status).toBe('success');
    expect(component.getSoftSkillDetailState(skill).data?.cursos[0].muestras.map((muestra) => muestra.id)).toEqual([1, 2]);

    component.toggleSoftSkillDetail(skill);
    component.toggleSoftSkillDetail(skill);

    expect(alumnoService.getSoftSkillMuestrasByAlumnoId).toHaveBeenCalledTimes(1);
  });

  it('should reset detail cache when the student changes and allow retry after an error', () => {
    alumnoService.getSoftSkillMuestrasByAlumnoId.and.returnValues(
      throwError(() => new Error('fallo')),
      of({
        alumnoId: 30,
        alumnoNombre: 'Luis Gomez',
        softSkill: {
          id: 1,
          codigo: 'ENFOQUE_DISTRACCIONES',
          nombre: 'Enfoque y concentracion',
          descripcion: 'Descripcion',
          tipoMedicion: 'PENALIZACION_POR_TRAMOS'
        },
        numMuestras: 1,
        cursos: []
      })
    );

    component.ngOnInit();
    component.toggleSoftSkillDetail(skill);

    expect(component.getSoftSkillDetailState(skill).status).toBe('error');

    component.retrySoftSkillDetail(skill);
    expect(alumnoService.getSoftSkillMuestrasByAlumnoId).toHaveBeenCalledTimes(2);

    route.setAlumnoId('30');

    expect(alumnoService.getResumenById).toHaveBeenCalledWith('30');
    expect(component.getSoftSkillDetailState(skill).status).toBe('idle');
    expect(component.getSoftSkillDetailState(skill).data).toBeNull();
  });
});
