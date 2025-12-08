import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { LotWithContractorDto } from '../models/business.models';
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

  // Note: CRUD operations for lots are not implemented in the backend
  // as lots are derived from contracts
}
