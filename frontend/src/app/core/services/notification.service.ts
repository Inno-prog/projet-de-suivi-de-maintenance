import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Notification {
  id: number;
  destinataire: string;
  titre: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  lu: boolean;
  dateCreation: string;
  prestationId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private eventSource: EventSource | null = null;
  private notificationSubject = new Subject<Notification>();

  constructor(private http: HttpClient) {}

  getNotifications(destinataire: string): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/${destinataire}`);
  }

  marquerCommeLu(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/marquer-lu`, {});
  }

  notifierPrestationTerminee(prestataire: string, prestationId: number, nomItem: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/prestation-terminee`, null, {
      params: { prestataire, prestationId: prestationId.toString(), nomItem }
    });
  }

  // SSE - Server-Sent Events pour notifications en temps réel
  connectToNotificationStream(email: string): void {
    if (this.eventSource) {
      this.eventSource.close();
    }

    const streamUrl = `${this.apiUrl}/stream/${encodeURIComponent(email)}`;
    console.log('NotificationService: SSE connecting to', streamUrl);

    this.eventSource = new EventSource(streamUrl);

    this.eventSource.onmessage = (event) => {
      try {
        const notification: Notification = JSON.parse(event.data);
        this.notificationSubject.next(notification);
      } catch (error) {
        console.error('Erreur parsing notification SSE:', error);
      }
    };

    this.eventSource.onerror = (event) => {
      console.error('SSE error', event);
    };

    this.eventSource.onopen = () => {
      console.log('SSE connection opened');
    };

    this.eventSource.addEventListener('close', () => {
      console.log('SSE connection closed');
      this.disconnectFromNotificationStream();
    }, false);
  }

  disconnectFromNotificationStream(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  getNotificationObservable(): Observable<Notification> {
    return this.notificationSubject.asObservable();
  }
}
