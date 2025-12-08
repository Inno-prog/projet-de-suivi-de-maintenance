import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, AppNotification } from './notification.service';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="relative" (keydown.escape)="close()" tabindex="0">
    <!-- Bell button -->
      <button
      (click)="toggle()"
      aria-haspopup="true"
      [attr.aria-expanded]="open"
      class="relative inline-flex items-center justify-center p-2 rounded-full hover:bg-yellow-100/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition text-yellow-500 hover:text-yellow-600 shadow-lg hover:shadow-xl"
      title="Notifications"
    >
      <!-- Bell SVG -->
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M15 17H9a3 3 0 01-3-3V10a6 6 0 1112 0v4a3 3 0 01-3 3z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M13.5 21a1.5 1.5 0 01-3 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>

      <!-- Badge -->
      <span *ngIf="(unread$ | async) as uCount" 
            class="absolute -top-1 -right-1 inline-flex items-center justify-center text-xs font-semibold rounded-full px-1.5 py-0.5"
            [class.hidden]="uCount===0"
            [ngClass]="{'bg-red-600 text-white': uCount>0, 'bg-slate-300 text-slate-800': uCount===0}">
        {{ uCount > 9 ? '9+' : uCount }}
      </span>
    </button>

    <!-- Dropdown -->
    <div *ngIf="open" class="absolute right-0 mt-3 w-80 max-h-96 overflow-auto bg-white shadow-2xl rounded-2xl ring-1 ring-black ring-opacity-5 z-50 transition transform origin-top-right animate-in"
         role="dialog" aria-label="Notifications panel">
      <div class="p-3 border-b flex items-center justify-between">
        <strong class="text-sm">Notifications</strong>
        <div class="flex gap-2 items-center">
          <button (click)="markAll()" class="text-xs px-2 py-1 rounded-md hover:bg-slate-100">Tout marquer lu</button>
          <button (click)="close()" class="text-xs px-2 py-1 rounded-md hover:bg-slate-100">Fermer</button>
        </div>
      </div>

      <ng-container *ngIf="(notifications$ | async) as notifs">
        <div *ngIf="notifs.length === 0" class="p-6 text-center text-sm text-slate-500">
          Aucune notification
        </div>

        <ul class="divide-y">
          <li *ngFor="let n of notifs" class="px-3 py-2 hover:bg-slate-50">
            <a (click)="openNotification(n)" class="flex gap-3 items-start cursor-pointer">
              <div class="flex-shrink-0">
                <span class="inline-flex items-center justify-center h-9 w-9 rounded-full ring-1 ring-slate-100 text-sm">
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M12 2v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium truncate">{{ n.title }}</p>
                  <p class="text-xs text-slate-400 ml-2">{{ n.time ? (n.time | date:'short') : '' }}</p>
                </div>
                <p class="text-sm text-slate-500 truncate">{{ n.body }}</p>
                <div class="mt-2 flex gap-2 items-center">
                  <button *ngIf="!n.read" (click)="markRead(n, $event)" class="text-xs px-2 py-0.5 rounded-md border border-slate-200 hover:bg-slate-50">Marquer lu</button>
                  <button (click)="remove(n, $event)" class="text-xs px-2 py-0.5 rounded-md border border-slate-200 hover:bg-slate-50">Supprimer</button>
                </div>
              </div>
            </a>
          </li>
        </ul>
      </ng-container>

    </div>
  </div>
  `,
  styles: [`
    /* Petite animation d'apparition */
    .animate-in { animation: pop 160ms cubic-bezier(.2,.8,.2,1); }
    @keyframes pop { from { opacity: 0; transform: scale(.98); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  open = false;
  notifications$!: Observable<AppNotification[]>;
  unread$!: Observable<number>;
  private authSub?: Subscription;

  constructor(private ns: NotificationService, private authService: AuthService) {
    this.notifications$ = this.ns.notifications$;
    this.unread$ = new Observable<number>(sub => {
      const subInner = this.ns.notifications$.subscribe(list => sub.next(list.filter(n => !n.read).length));
      return () => subInner.unsubscribe();
    });
  }

  ngOnInit(): void {
    // Connect to SSE when we have a logged-in user with email
    this.authSub = this.authService.currentUser$.subscribe(user => {
      if (user && user.email) {
        // connect to SSE for realtime notifications
        this.ns.connectSse(user.email);
      } else {
        // disconnect SSE when no user
        this.ns.disconnectSse();
      }
    });
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
    this.ns.disconnectSse();
  }

  toggle() { this.open = !this.open; }

  close() { this.open = false; }

  markRead(n: AppNotification, ev?: Event) {
    if (ev) ev.stopPropagation();
    this.ns.markAsRead(n.id);
  }

  markAll() {
    this.ns.markAllAsRead();
  }

  remove(n: AppNotification, ev?: Event) {
    if (ev) ev.stopPropagation();
    this.ns.remove(n.id);
  }

  openNotification(n: AppNotification) {
    this.ns.markAsRead(n.id);
    if (n.url) {
      window.open(n.url, '_blank');
    } else {
      console.log('Ouverture notification :', n);
    }
    this.close();
  }


  @HostListener('document:click', ['$event'])
  docClick(evt: Event) {
    const target = evt.target as HTMLElement;
    if (!target.closest('app-notification-bell') && !target.closest('.relative')) {
      this.open = false;
    }
  }
}
