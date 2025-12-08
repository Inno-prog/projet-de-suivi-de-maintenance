import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { AuthService } from './core/services/auth.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, LayoutComponent],
  template: `
    <ng-container *ngIf="authService.isAuthenticated()">
      <app-layout>
        <router-outlet></router-outlet>
      </app-layout>
    </ng-container>
    <ng-container *ngIf="!authService.isAuthenticated()">
      <router-outlet></router-outlet>
    </ng-container>
  `
})
export class AppComponent {
  title = 'DGSI Maintenance';

  constructor(public authService: AuthService) {}
}
