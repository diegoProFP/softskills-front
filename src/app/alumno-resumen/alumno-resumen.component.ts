import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlumnoConTotales } from '../modelo/alumno-con-totales';
import { SoftSkillTotalDTO, sortSoftSkillsByNombre } from '../modelo/softskill-total';
import { AlumnoService } from '../services/alumno.service';
import { AuthService } from '../services/auth.service';

interface MetricCard {
  label: string;
  value: string;
  accentClass: string;
  icon: string;
}

@Component({
  selector: 'app-alumno-resumen',
  templateUrl: './alumno-resumen.component.html',
  styleUrls: ['./alumno-resumen.component.scss']
})
export class AlumnoResumenComponent implements OnInit {
  alumnoId: string | null = null;
  alumno: AlumnoConTotales | null = null;
  loading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alumnoService: AlumnoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.alumnoId = this.route.snapshot.paramMap.get('alumnoId');

    if (!this.alumnoId) {
      this.errorMessage = 'No se pudo identificar al alumno.';
      this.loading = false;
      return;
    }

    this.authService.setPortalMode('student');
    this.authService.setStudentPortalUrl(this.router.url);
    this.cargarResumen();
  }

  get metricCards(): MetricCard[] {
    return [
      {
        label: 'Posicion en ranking',
        value: typeof this.alumno?.posicionRanking === 'number' ? `${this.alumno.posicionRanking}${this.ordinalIndicator}` : 'S/R',
        accentClass: 'accent-sun',
        icon: 'workspace_premium'
      },
      {
        label: 'Score global',
        value: typeof this.alumno?.rankingScore === 'number' ? this.alumno.rankingScore.toFixed(2) : '-',
        accentClass: 'accent-aqua',
        icon: 'insights'
      },
      {
        label: 'Muestras acumuladas',
        value: typeof this.alumno?.numMuestrasTotales === 'number' ? `${this.alumno.numMuestrasTotales}` : '-',
        accentClass: 'accent-coral',
        icon: 'auto_awesome'
      }
    ];
  }

  get sortedSoftSkills(): SoftSkillTotalDTO[] {
    return sortSoftSkillsByNombre(this.alumno?.totalesPorSkill);
  }

  get alumnoNombre(): string {
    return this.alumno?.nombre || 'Tu resumen';
  }

  get maxSkillValue(): number {
    return this.sortedSoftSkills.reduce((max, skill) => Math.max(max, skill.puntuacionTotal ?? 0), 0);
  }

  recargar(): void {
    this.cargarResumen();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        void this.router.navigate(['/login']);
      },
      error: () => {
        this.authService.clearSession();
        void this.router.navigate(['/login']);
      }
    });
  }

  trackBySkill(index: number, softSkill: SoftSkillTotalDTO): string {
    return softSkill.codigo || `${softSkill.id}-${softSkill.nombre}`;
  }

  getSkillRelativeProgress(skill: SoftSkillTotalDTO): number {
    if (this.maxSkillValue <= 0) {
      return 0;
    }

    return Math.round((skill.puntuacionTotal / this.maxSkillValue) * 100);
  }

  getSkillCircumference(): number {
    return 2 * Math.PI * this.skillRadius;
  }

  getSkillStrokeOffset(skill: SoftSkillTotalDTO): number {
    const progress = this.getSkillRelativeProgress(skill);
    return this.getSkillCircumference() * (1 - progress / 100);
  }

  getSkillTone(skill: SoftSkillTotalDTO): string {
    const code = skill.codigo || '';

    switch (code) {
      case 'TRABAJO_EN_EQUIPO':
        return 'tone-team';
      case 'COMUNICACION':
        return 'tone-comms';
      case 'AUTONOMIA':
        return 'tone-autonomy';
      case 'RESPONSABILIDAD':
        return 'tone-responsibility';
      case 'GESTION_EMOCIONAL':
        return 'tone-emotion';
      case 'RESOLUCION_DE_PROBLEMAS':
        return 'tone-problem-solving';
      case 'RESPETO':
        return 'tone-respect';
      case 'PARTICIPACION':
        return 'tone-participation';
      case 'ENFOQUE_DISTRACCIONES':
        return 'tone-focus';
      default:
        return 'tone-generic';
    }
  }

  private readonly ordinalIndicator = '\u00BA';
  private readonly skillRadius = 48;

  private cargarResumen(): void {
    if (!this.alumnoId) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.alumnoService.getResumenById(this.alumnoId).subscribe({
      next: (alumno) => {
        this.alumno = alumno;
        this.loading = false;
      },
      error: (error) => {
        this.alumno = null;
        this.errorMessage = error?.status === 404
          ? 'No se encontro el resumen del alumno.'
          : 'No se pudo cargar el resumen del alumno.';
        this.loading = false;
      }
    });
  }
}
