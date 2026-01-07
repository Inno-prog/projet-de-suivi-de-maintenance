import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap, switchMap, catchError } from 'rxjs/operators';

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

  /**
   * Vérifie si une fiche existe déjà pour une prestation donnée
   */
  checkFicheExists(prestationId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.API_URL}/exists/${prestationId}`);
  }

  /**
   * Crée une fiche avec vérification anti-duplication côté client
   */
  createFicheWithDuplicateCheck(fiche: FichePrestation): Observable<FichePrestation> {
    // Si la fiche a un idPrestation, vérifier d'abord s'il existe déjà
    if (fiche.idPrestation) {
      return this.checkFicheExists(fiche.idPrestation).pipe(
        switchMap(exists => {
          if (exists) {
            // Fiche existe déjà, retourner une erreur
            return throwError(() => new Error(`Une fiche de prestation existe déjà pour cette prestation (ID: ${fiche.idPrestation})`));
          }
          // Fiche n'existe pas, procéder à la création
          return this.createFiche(fiche);
        }),
        catchError(error => {
          // Propager l'erreur ou la transformer
          if (error.status === 409) {
            return throwError(() => new Error('Conflit: Une fiche existe déjà pour cette prestation'));
          }
          return throwError(() => error);
        })
      );
    }
    
    // Si pas d'idPrestation, créer directement
    return this.createFiche(fiche);
  }

  updateFiche(id: number, updates: any): Observable<FichePrestation> {
    return this.http.put<FichePrestation>(`${this.API_URL}/${id}`, updates);
  }

  deleteFiche(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  validerFiche(id: number, commentaires?: string): Observable<FichePrestation> {
    const params = commentaires ? `?commentaires=${commentaires}` : '';
    return this.http.put<FichePrestation>(`${this.API_URL}/${id}/valider${params}`, {}).pipe(
      tap(() => {
        // Invalider le cache après validation
        this.cacheService.clear(this.CACHE_KEY);
      })
    );
  }

  rejeterFiche(id: number, commentaires?: string): Observable<FichePrestation> {
    const params = commentaires ? `?commentaires=${commentaires}` : '';
    return this.http.put<FichePrestation>(`${this.API_URL}/${id}/rejeter${params}`, {}).pipe(
      tap(() => {
        // Invalider le cache après rejet
        this.cacheService.clear(this.CACHE_KEY);
      })
    );
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

  downloadIndividualFichePdf(ficheId: number): Observable<Blob> {
    return this.http.get(`${this.API_URL}/${ficheId}/pdf`, {
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
