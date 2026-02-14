import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { StructureMefp } from '../models/business.models';
import { environment } from '../../../environments/environment';

export interface RegionHierarchy {
  nom: string;
  villes: VilleHierarchy[];
}

export interface VilleHierarchy {
  nom: string;
  structures: StructureInfo[];
}

export interface StructureInfo {
  id: string;
  nom: string;
  categorie?: string;
  contact?: string;
  contact1?: string;
  contact2?: string;
  contact3?: string;
  email?: string;
  adresseStructure?: string;
  description?: string;
  nomCI?: string;
  prenomCI?: string;
  contactCI?: string;
  fonctionCI?: string;
  lot?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

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

  getHierarchy(): Observable<RegionHierarchy[]> {
    return this.http.get<RegionHierarchy[]>(`${this.API_URL}/hierarchy`, { headers: this.getHeaders() });
  }

  // Nouveaux endpoints pour les données de référence
  getAllRegions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/regions`, { headers: this.getHeaders() });
  }

  getAllVilles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/villes`, { headers: this.getHeaders() });
  }

  getVillesByRegion(region: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/regions/${encodeURIComponent(region)}/villes`, { headers: this.getHeaders() });
  }

  getAllStructuresPaginated(page: number = 0, size: number = 12, sortBy: string = 'nom', sortDirection: string = 'asc'): Observable<any> {
    const params = `?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`;
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

  getStructuresByLotId(lotId: number): Observable<StructureMefp[]> {
    return this.http.get<StructureMefp[]>(`${this.API_URL}/by-lot/${lotId}`, { headers: this.getHeaders() });
  }

  getStructuresByRegion(region: string): Observable<StructureMefp[]> {
    return this.http.get<StructureMefp[]>(`${this.API_URL}/by-region/${encodeURIComponent(region)}`, { headers: this.getHeaders() });
  }

  getStructuresByVille(ville: string): Observable<StructureMefp[]> {
    return this.http.get<StructureMefp[]>(`${this.API_URL}/by-ville/${encodeURIComponent(ville)}`, { headers: this.getHeaders() });
  }

  getStructuresByRegionAndVille(region: string, ville: string): Observable<StructureMefp[]> {
    return this.http.get<StructureMefp[]>(`${this.API_URL}/by-region/${encodeURIComponent(region)}/ville/${encodeURIComponent(ville)}`, { headers: this.getHeaders() });
  }

  /**
   * Get structures by lot regions - used when a lot is selected in prestation form
   */
  getStructuresByLotRegions(lotId: number): Observable<StructureMefp[]> {
    return this.http.get<StructureMefp[]>(`${this.API_URL}/by-lot-regions/${lotId}`, { headers: this.getHeaders() });
  }
}
