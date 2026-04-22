import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlumnoConTotales } from '../modelo/alumno-con-totales';
import { SoftSkillTotalDTO, sortSoftSkillsByNombre } from '../modelo/softskill-total';
import { AlumnoService } from '../services/alumno.service';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

interface MetricCard {
  label: string;
  value: string;
  accentClass: string;
  icon: string;
}

interface RadarPoint {
  x: number;
  y: number;
}

interface RadarLabelPoint extends RadarPoint {
  anchor: 'start' | 'middle' | 'end';
}

interface RadarLabel extends RadarLabelPoint {
  lines: string[];
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
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.alumnoId = this.route.snapshot.queryParamMap.get('idalumno')
      || this.route.snapshot.paramMap.get('alumnoId');

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
        label: 'Posicion en ranking de grupo',
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

  get radarScaleMax(): number {
    const maxValue = this.maxSkillValue;

    if (maxValue <= 0) {
      return 10;
    }

    if (maxValue <= 10) {
      return 10;
    }

    const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
    return Math.ceil(maxValue / magnitude) * magnitude;
  }

  get radarLevels(): number[] {
    const levels = 4;
    return Array.from({ length: levels }, (_, index) => index + 1);
  }

  get radarScaleLabels(): number[] {
    return this.radarLevels.map((level) => Math.round((this.radarScaleMax * level) / this.radarLevels.length));
  }

  get radarAxisPoints(): RadarPoint[] {
    return this.sortedSoftSkills.map((_, index) => this.getRadarPoint(index, 1));
  }

  get radarGridPolygons(): string[] {
    return this.radarLevels.map((level) =>
      this.sortedSoftSkills
        .map((_, index) => {
          const point = this.getRadarPoint(index, level / this.radarLevels.length);
          return `${point.x},${point.y}`;
        })
        .join(' ')
    );
  }

  get radarDataPolygon(): string {
    if (this.sortedSoftSkills.length === 0) {
      return '';
    }

    return this.sortedSoftSkills
      .map((skill, index) => {
        const ratio = this.radarScaleMax > 0 ? skill.puntuacionTotal / this.radarScaleMax : 0;
        const point = this.getRadarPoint(index, ratio);
        return `${point.x},${point.y}`;
      })
      .join(' ');
  }

  get radarDataPoints(): RadarPoint[] {
    return this.sortedSoftSkills.map((skill, index) => {
      const ratio = this.radarScaleMax > 0 ? skill.puntuacionTotal / this.radarScaleMax : 0;
      return this.getRadarPoint(index, ratio);
    });
  }

  get radarLabels(): RadarLabel[] {
    return this.sortedSoftSkills.map((_, index) => {
      const point = this.getRadarPoint(index, 1.22);
      return {
        ...point,
        anchor: this.getRadarLabelAnchor(point.x),
        lines: this.getRadarLabelLines(this.sortedSoftSkills[index].nombre)
      };
    });
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

  getRadarLabelLines(label: string): string[] {
    const words = label.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
      const candidate = currentLine ? `${currentLine} ${word}` : word;

      if (candidate.length > 16 && currentLine) {
        lines.push(currentLine);
        currentLine = word;
        return;
      }

      currentLine = candidate;
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.slice(0, 3);
  }

  private readonly ordinalIndicator = '\u00BA';
  private readonly skillRadius = 48;
  private readonly radarCenter = 260;
  private readonly radarRadius = 150;

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
        this.errorMessage = this.notificationService.showHttpError(
          error,
          error?.status === 404
            ? 'No se encontro el resumen del alumno.'
            : 'No se pudo cargar el resumen del alumno.'
        );
        this.loading = false;
      }
    });
  }

  private getRadarPoint(index: number, ratio: number): RadarPoint {
    const total = Math.max(this.sortedSoftSkills.length, 1);
    const angle = (-Math.PI / 2) + ((Math.PI * 2 * index) / total);
    const clampedRatio = Math.max(0, Math.min(ratio, 1));
    const distance = this.radarRadius * clampedRatio;

    return {
      x: this.radarCenter + Math.cos(angle) * distance,
      y: this.radarCenter + Math.sin(angle) * distance
    };
  }

  private getRadarLabelAnchor(x: number): 'start' | 'middle' | 'end' {
    const delta = x - this.radarCenter;

    if (Math.abs(delta) < 16) {
      return 'middle';
    }

    return delta > 0 ? 'start' : 'end';
  }
}
