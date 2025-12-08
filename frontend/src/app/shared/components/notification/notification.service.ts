import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NotificationService as CoreNotificationService } from '../../../core/services/notification.service';

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

  constructor(private coreNotificationService: CoreNotificationService) {
    // Real notifications will be loaded via SSE connection
  }

  private eventSource?: EventSource | null = null;

  /**
   * Connect to backend SSE stream for the given destinataire (usually user email).
   * The backend endpoint: /api/notifications/stream/{destinataire}
   */
  connectSse(destinataire: string) {
    try {
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }

      const url = `/api/notifications/stream/${encodeURIComponent(destinataire)}`;
      this.eventSource = new EventSource(url);

      console.log('NotificationService: SSE connecting to', url);

      this.eventSource.onopen = () => {
        console.log('NotificationService: SSE connection opened');
      };

      this.eventSource.onmessage = (evt) => {
        try {
          const payload = JSON.parse(evt.data);
          // handle initial batch
          if (payload && Array.isArray(payload)) {
            // initial notifications array
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
        // Try to reconnect after short delay
        this.eventSource?.close();
        this.eventSource = null;
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

    // Also mark as read in backend
    const numericId = parseInt(id, 10);
    if (!isNaN(numericId)) {
      this.coreNotificationService.marquerCommeLu(numericId).subscribe({
        next: () => console.log('Notification marked as read in backend'),
        error: (err) => console.error('Failed to mark notification as read in backend:', err)
      });
    }
  }

  markAllAsRead() {
    const list = this._notifications$.value.map(n => ({ ...n, read: true }));
    this._notifications$.next(list);

    // Also mark all as read in backend
    this._notifications$.value.forEach(n => {
      const numericId = parseInt(n.id, 10);
      if (!isNaN(numericId) && !n.read) {
        this.coreNotificationService.marquerCommeLu(numericId).subscribe({
          next: () => console.log(`Notification ${numericId} marked as read in backend`),
          error: (err) => console.error(`Failed to mark notification ${numericId} as read in backend:`, err)
        });
      }
    });
  }

  remove(id: string) {
    const list = this._notifications$.value.filter(n => n.id !== id);
    this._notifications$.next(list);
  }


  // Example: realtime connection (WebSocket/SSE) - adapt to backend
  // connectRealtime(wsUrl: string) {
  //   const ws = new WebSocket(wsUrl);
  //   ws.onmessage = (evt) => {
  //     try {
  //       const payload = JSON.parse(evt.data);
  //       this.push({ id: payload.id, title: payload.title, body: payload.body, time: payload.time, read: false, url: payload.url });
  //     } catch(e) { console.error(e); }
  //   };
  // }
}
