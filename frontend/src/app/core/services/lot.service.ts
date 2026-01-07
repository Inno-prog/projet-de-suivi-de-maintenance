import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { LotWithContractorDto, Lot } from '../models/business.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LotService {
  private API_URL = `${environment.apiUrl}/lots`;

  constructor(private http: HttpClient) {}

  getAllLots(): Observable<LotWithContractorDto[]> {
    return this.http.get<LotWithContractorDto[]>(this.API_URL);
  }

  getActiveLots(): Observable<LotWithContractorDto[]> {
    return this.http.get<LotWithContractorDto[]>(`${this.API_URL}/active`);
  }

  getAllLotEntities(): Observable<Lot[]> {
    return this.http.get<Lot[]>(`${this.API_URL}/entities`);
  }

  getLotsByPrestataire(prestataireId: string): Observable<LotWithContractorDto[]> {
    return this.http.get<LotWithContractorDto[]>(`${this.API_URL}/by-prestataire/${prestataireId}`);
  }

  // CRUD operations for lots
  createLot(lot: Lot): Observable<Lot> {
    return this.http.post<Lot>(this.API_URL, lot);
  }

  updateLot(id: number, lot: Lot): Observable<Lot> {
    return this.http.put<Lot>(`${this.API_URL}/${id}`, lot);
  }

  deleteLot(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
