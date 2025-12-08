import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { StructureMefp } from '../models/business.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StructureMefpService {
  private API_URL = `${environment.apiUrl}/structures-mefp`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    // Let the interceptor handle auth
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  createStructure(structure: StructureMefp): Observable<StructureMefp> {
    return this.http.post<StructureMefp>(this.API_URL, structure, { headers: this.getHeaders() });
  }

  getAllStructures(): Observable<StructureMefp[]> {
    return this.http.get<StructureMefp[]>(this.API_URL, { headers: this.getHeaders() });
  }

  getAllStructuresPaginated(page: number = 0, size: number = 12): Observable<any> {
    const params = `?page=${page}&size=${size}`;
    return this.http.get<any>(`${this.API_URL}/paginated${params}`, { headers: this.getHeaders() });
  }

  getStructureById(id: string): Observable<StructureMefp> {
    return this.http.get<StructureMefp>(`${this.API_URL}/${id}`, { headers: this.getHeaders() });
  }

  updateStructure(id: string, structure: StructureMefp): Observable<StructureMefp> {
    return this.http.put<StructureMefp>(`${this.API_URL}/${id}`, structure, { headers: this.getHeaders() });
  }

  deleteStructure(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`, { headers: this.getHeaders() });
  }
}