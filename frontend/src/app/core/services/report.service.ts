import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(private http: HttpClient) {}

  exportPrestationsPdf(reportData: any): Observable<Blob> {
    // responseType: 'blob' must be specified
    return this.http.post('/api/reports/prestations/pdf', reportData, { responseType: 'blob' });
  }
}