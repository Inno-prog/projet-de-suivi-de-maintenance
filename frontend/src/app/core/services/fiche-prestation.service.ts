import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { FichePrestation, LotWithContractorDto } from '../models/business.models';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class FichePrestationService {
  private readonly CACHE_KEY = 'fiches';
  private API_URL = `${environment.apiUrl}/fiches-prestation`;

  constructor(private http: HttpClient, private authService: AuthService, private cacheService: CacheService) {}

  getAllFiches(): Observable<FichePrestation[]> {
    const cachedData = this.cacheService.get(this.CACHE_KEY);
    if (cachedData) {
      return of(cachedData);
    }

    return this.http.get<FichePrestation[]>(this.API_URL).pipe(
      tap(fiches => {
        this.cacheService.set(this.CACHE_KEY, fiches);
      })
    );
  }

  getFicheById(id: number): Observable<FichePrestation> {
    return this.http.get<FichePrestation>(`${this.API_URL}/${id}`);
  }

  getFicheByPrestationId(prestationId: string): Observable<FichePrestation> {
    return this.http.get<FichePrestation>(`${this.API_URL}/by-prestation/${prestationId}`);
  }

  createFiche(fiche: FichePrestation): Observable<FichePrestation> {
    return this.http.post<FichePrestation>(this.API_URL, fiche);
  }

  updateFiche(id: number, updates: any): Observable<FichePrestation> {
    return this.http.put<FichePrestation>(`${this.API_URL}/${id}`, updates);
  }

  deleteFiche(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  validerFiche(id: number, commentaires?: string): Observable<FichePrestation> {
    const params = commentaires ? `?commentaires=${commentaires}` : '';
    return this.http.put<FichePrestation>(`${this.API_URL}/${id}/valider${params}`, {});
  }

  rejeterFiche(id: number, commentaires?: string): Observable<FichePrestation> {
    const params = commentaires ? `?commentaires=${commentaires}` : '';
    return this.http.put<FichePrestation>(`${this.API_URL}/${id}/rejeter${params}`, {});
  }

  getLotsWithContractors(annee: number, trimestre: number): Observable<LotWithContractorDto[]> {
    return this.http.get<LotWithContractorDto[]>(`${this.API_URL}/lots/${annee}/${trimestre}`);
  }

  getFichesForLotAndQuarter(lot: string, annee: number, trimestre: number): Observable<FichePrestation[]> {
    return this.http.get<FichePrestation[]>(`${this.API_URL}/lots/${lot}/fiches/${annee}/${trimestre}`);
  }

  downloadLotQuarterlyPdf(lot: string, annee: number, trimestre: number): Observable<Blob> {
    return this.http.get(`${this.API_URL}/lots/${lot}/pdf/${annee}/${trimestre}`, {
      responseType: 'blob'
    });
  }

  downloadGlobalServiceSheetPdf(lot: string, annee: number, trimestre: number): Observable<Blob> {
    return this.http.get(`${this.API_URL}/lots/${lot}/fiche-globale/${annee}/${trimestre}`, {
      responseType: 'blob'
    });
  }

  downloadPrestataireServiceSheetPdf(lot: string, annee: number, trimestre: number, prestataire: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/lots/${lot}/fiche-prestataire/${annee}/${trimestre}/${encodeURIComponent(prestataire)}`, {
      responseType: 'blob'
    });
  }

  getFichesByPrestataire(prestataireId: number): Observable<FichePrestation[]> {
    return this.http.get<FichePrestation[]>(`${this.API_URL}/prestataire/${prestataireId}`);
  }

  getFichesByLot(trimestre: number, lotId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/ordres-commande/trimestre/${trimestre}/lot/${lotId}/fiches`);
  }
}
