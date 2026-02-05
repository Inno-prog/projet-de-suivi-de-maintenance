import { Injectable } from '@angular/core';
  import { BehaviorSubject } from 'rxjs';
  import { HttpClient } from '@angular/common/http';
  import { environment } from '../../../../environments/environment';

  export interface AppNotification {
    id: string;
    title: string;
    body?: string;
    time?: string;
    read?: boolean;
    url?: string;
  }

  @Injectable({ providedIn: 'root' })
  export class NotificationService {
    private _notifications$ = new BehaviorSubject<AppNotification[]>([]);
    public notifications$ = this._notifications$.asObservable();

    constructor(private http: HttpClient) {}

    private eventSource?: EventSource | null = null;
    private currentDestinataire: string | null = null;

    /**
     * Load existing notifications from backend for the given destinataire
     */
    loadNotifications(destinataire: string) {
      const url = `${environment.apiUrl}/notifications/${encodeURIComponent(destinataire)}`;
      console.log('NotificationService: Loading notifications from', url);
      
      this.http.get<any[]>(url).subscribe({
        next: (notifications) => {
          console.log('NotificationService: Loaded', notifications.length, 'notifications');
          const mappedNotifications: AppNotification[] = notifications.map(n => ({
            id: n.id ? n.id.toString() : Date.now().toString(),
            title: n.titre || n.title || 'Notification',
            body: n.message || n.body || '',
            time: n.dateCreation || new Date().toISOString(),
            read: !!n.lu
          }));
          this._notifications$.next(mappedNotifications);
        },
        error: (err) => {
          console.error('NotificationService: Failed to load notifications', err);
        }
      });
    }

    /**
     * Connect to backend SSE stream for the given destinataire (usually user email).
     */
    connectSse(destinataire: string) {
      try {
        if (this.eventSource && this.currentDestinataire === destinataire && this.eventSource.readyState === 1) {
          console.log('NotificationService: SSE already connected to', destinataire);
          return;
        }

        if (this.eventSource) {
          try { this.eventSource.close(); } catch (_) {}
          this.eventSource = null;
          this.currentDestinataire = null;
        }

        // Load existing notifications first
        this.loadNotifications(destinataire);

        const url = `${environment.apiUrl}/notifications/stream/${encodeURIComponent(destinataire)}`;
        console.log('NotificationService: SSE connecting to', url);
        this.eventSource = new EventSource(url);
        this.currentDestinataire = destinataire;

      this.eventSource.onopen = () => {
        console.log('NotificationService: SSE connection opened');
      };

      this.eventSource.onmessage = (evt) => {
        try {
          const payload = JSON.parse(evt.data);
          if (payload && Array.isArray(payload)) {
            payload.forEach((p: any) => {
              const n: AppNotification = {
                id: p.id ? p.id.toString() : Date.now().toString(),
                title: p.titre || p.title || 'Notification',
                body: p.message || p.body || '',
                time: p.dateCreation || new Date().toISOString(),
                read: !!p.lu
              };
              this.pushIfNotExists(n);
            });
            return;
          }

          const n: AppNotification = {
            id: payload.id ? payload.id.toString() : Date.now().toString(),
            title: payload.titre || payload.title || 'Notification',
            body: payload.message || payload.body || '',
            time: payload.dateCreation || new Date().toISOString(),
            read: false
          };
          this.pushIfNotExists(n);
        } catch (e) {
          console.error('Failed to parse SSE notification', e, evt.data);
        }
      };

      this.eventSource.onerror = (err) => {
        console.error('SSE error', err);
        try { this.eventSource?.close(); } catch (_) {}
        this.eventSource = null;
        this.currentDestinataire = null;
        setTimeout(() => this.connectSse(destinataire), 3000);
      };

    } catch (e) {
      console.error('Could not open SSE connection', e);
    }
  }

  disconnectSse() {
    if (this.eventSource) {
      try { this.eventSource.close(); } catch(_) {}
      this.eventSource = null;
    }
  }

  private pushIfNotExists(notification: AppNotification) {
    const exists = this._notifications$.value.some(n => n.id === notification.id);
    if (!exists) this.push(notification);
  }

  get unreadCount(): number {
    return this._notifications$.value.filter(n => !n.read).length;
  }

  push(notification: AppNotification) {
    const list = [notification, ...this._notifications$.value];
    this._notifications$.next(list);
  }

  markAsRead(id: string) {
    const list = this._notifications$.value.map(n => n.id === id ? { ...n, read: true } : n);
    this._notifications$.next(list);

    const numericId = parseInt(id, 10);
    if (!isNaN(numericId)) {
      this.http.put(`${environment.apiUrl}/notifications/${numericId}/marquer-lu`, {}).subscribe({
        next: () => console.log('Notification marked as read in backend'),
        error: (err) => console.error('Failed to mark notification as read:', err)
      });
    }
  }

  markAllAsRead() {
    const list = this._notifications$.value.map(n => ({ ...n, read: true }));
    this._notifications$.next(list);

    this._notifications$.value.forEach(n => {
      const numericId = parseInt(n.id, 10);
      if (!isNaN(numericId) && !n.read) {
        this.http.put(`${environment.apiUrl}/notifications/${numericId}/marquer-lu`, {}).subscribe({
          next: () => console.log(`Notification ${numericId} marked as read`),
          error: (err) => console.error(`Failed to mark notification ${numericId}:`, err)
        });
      }
    });
  }

  remove(id: string) {
    const list = this._notifications$.value.filter(n => n.id !== id);
    this._notifications$.next(list);
  }
}
