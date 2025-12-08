import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-oc-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Ordres de Commande</h1>
      <p class="text-gray-600 mb-8">Sélectionnez un trimestre pour voir les lots correspondants</p>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          *ngFor="let quarter of quarters"
          class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border-2 border-transparent hover:border-blue-500 p-6"
          (click)="navigateToQuarter(quarter)"
        >
          <div class="text-center">
            <div class="text-4xl mb-3">📅</div>
            <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ quarter.name }}</h3>
            <p class="text-gray-600 text-sm">{{ quarter.period }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background-color: #f8fafc;
      min-height: 100vh;
    }
  `]
})
export class OcDashboardComponent implements OnInit {
  quarters = [
    { id: 1, name: 'Trimestre 1', period: 'Janvier - Mars' },
    { id: 2, name: 'Trimestre 2', period: 'Avril - Juin' },
    { id: 3, name: 'Trimestre 3', period: 'Juillet - Septembre' },
    { id: 4, name: 'Trimestre 4', period: 'Octobre - Décembre' }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {}

  navigateToQuarter(quarter: any): void {
    this.router.navigate(['/ordres-commande/trimestre', quarter.id]);
  }
}
