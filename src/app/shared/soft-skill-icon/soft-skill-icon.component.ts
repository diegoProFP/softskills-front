import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SoftSkillCode, SoftSkillCodeValue } from '../../modelo/softskill';

@Component({
  selector: 'app-soft-skill-icon',
  templateUrl: './soft-skill-icon.component.html',
  styleUrls: ['./soft-skill-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SoftSkillIconComponent implements OnChanges {
  @Input() code: SoftSkillCodeValue | null | undefined;
  @Input() label: string | null | undefined;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  imageLoadError = false;

  get imageSrc(): string {
    const normalizedCode = this.code || SoftSkillCode.GENERICA;
    const fileName = this.imageLoadError ? SoftSkillCode.GENERICA : normalizedCode;

    return `assets/soft-skills/${fileName}.png`;
  }

  get ariaLabel(): string {
    return this.label ? `Icono de ${this.label}` : 'Icono de soft skill';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['code']) {
      this.imageLoadError = false;
    }
  }

  handleImageError(): void {
    if (this.code !== SoftSkillCode.GENERICA && !this.imageLoadError) {
      this.imageLoadError = true;
    }
  }
}
