import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AlumnoService } from './alumno.service';

describe('AlumnoService', () => {
  let service: AlumnoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(AlumnoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should request soft skill samples for a student', () => {
    service.getSoftSkillMuestrasByAlumnoId('25', 1).subscribe();

    const request = httpMock.expectOne((req) =>
      req.method === 'GET' && req.url.endsWith('/alumnos/25/soft-skills/1/muestras')
    );

    request.flush({
      alumnoId: 25,
      alumnoNombre: 'Ana Perez',
      softSkill: {
        id: 1,
        codigo: 'ENFOQUE_DISTRACCIONES',
        nombre: 'Enfoque y concentracion',
        descripcion: 'Descripcion',
        tipoMedicion: 'PENALIZACION_POR_TRAMOS'
      },
      numMuestras: 0,
      cursos: []
    });
  });
});
