import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AdminLayoutComponent } from '../admin-layout/admin-layout.component';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AdminLayoutComponent],
  template: `
    <app-admin-layout>
      <router-outlet></router-outlet>
    </app-admin-layout>
  `
})
export class AdminShellComponent {}
