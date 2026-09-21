import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="btn-group" role="group">
      <button
        class="btn btn-sm"
        [class.btn-primary]="i18n.lang === 'ar'"
        [class.btn-outline-primary]="i18n.lang !== 'ar'"
        (click)="switchLang('ar')"
      >
        {{ i18n.t('arabic') }}
      </button>
      <button
        class="btn btn-sm"
        [class.btn-primary]="i18n.lang === 'en'"
        [class.btn-outline-primary]="i18n.lang !== 'en'"
        (click)="switchLang('en')"
      >
        {{ i18n.t('english') }}
      </button>
    </div>
  `
})
export class LanguageSwitcherComponent {
  constructor(public i18n: I18nService) {}

  switchLang(lang: 'ar' | 'en') {
    this.i18n.setLang(lang);
    window.location.reload();
  }
}
