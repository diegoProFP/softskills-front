import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'soft-skills-theme';
  private readonly modeSubject = new BehaviorSubject<ThemeMode>(this.getInitialMode());

  readonly mode$ = this.modeSubject.asObservable();

  get isDarkMode(): boolean {
    return this.modeSubject.value === 'dark';
  }

  toggleTheme(): void {
    this.setMode(this.isDarkMode ? 'light' : 'dark');
  }

  setDarkMode(enabled: boolean): void {
    this.setMode(enabled ? 'dark' : 'light');
  }

  private setMode(mode: ThemeMode): void {
    this.modeSubject.next(mode);
    localStorage.setItem(this.storageKey, mode);
  }

  private getInitialMode(): ThemeMode {
    const storedMode = localStorage.getItem(this.storageKey);

    if (storedMode === 'dark' || storedMode === 'light') {
      return storedMode;
    }

    return 'dark';
  }
}
