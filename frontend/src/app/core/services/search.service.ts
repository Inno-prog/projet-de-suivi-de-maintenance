import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface SearchResult {
  id: any;
  type: 'contrat' | 'fiche' | 'item' | 'evaluation' | 'prestation' | 'structure' | 'user' | 'lot';
  title: string;
  description: string;
  icon: string;
  route: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private API_URL = `${environment.apiUrl}/search`;

  constructor(private http: HttpClient) { }

  search(query: string): Observable<SearchResult[]> {
    if (!query.trim() || query.length < 2) {
      return of([]);
    }

    const params = new HttpParams().set('q', query.trim());

    return this.http.get<SearchResult[]>(this.API_URL, { params }).pipe(
      catchError(() => of([]))
    );
  }
}
