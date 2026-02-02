import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService, AppNotification } from './notification.service';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  styleUrls: ['./notification-bell.css'],
  template: `
  <div class="notification-wrapper relative" (keydown.escape)="close()" tabindex="0">
    <!-- Bell button -->
      <button
      (click)="toggle()"
      aria-haspopup="true"
      [attr.aria-expanded]="open"
      class="notification-bell-btn"
      title="Notifications"
    >
      <!-- Material bell icon -->
      <mat-icon class="bell-icon" aria-hidden="true">notifications</mat-icon>

      <!-- Badge -->
      <span *ngIf="(unread$ | async) as uCount" 
            class="absolute -top-1 -right-1 inline-flex items-center justify-center text-xs font-semibold rounded-full px-1.5 py-0.5"
            [class.hidden]="uCount===0"
            [ngClass]="{'bg-red-600 text-white': uCount>0, 'bg-slate-300 text-slate-800': uCount===0}">
        {{ uCount > 9 ? '9+' : uCount }}
      </span>
    </button>

    <!-- Dropdown -->
    <div *ngIf="open" class="notification-dropdown" role="dialog" aria-label="Notifications panel">
      <div class="notification-dropdown-header">
        <strong class="title">Notifications</strong>
        <div class="notification-header-actions">
          <button (click)="markAll()" class="notification-mark-all-btn">Tout marquer lu</button>
          <button (click)="close()" class="notification-close-btn">Fermer</button>
        </div>
      </div>

      <ng-container *ngIf="(notifications$ | async) as notifs">
        <div *ngIf="notifs.length === 0" class="notification-empty">
          <mat-icon>notifications_none</mat-icon>
          <p>Aucune notification</p>
        </div>

        <ul class="notification-list">
          <li *ngFor="let n of notifs" class="notification-list-item">
            <a (click)="openNotification(n)" class="notification-link">
              <div class="notification-icon-wrapper">
                <div class="notification-icon-circle">
                  <mat-icon>notifications</mat-icon>
                </div>
              </div>
              <div class="notification-content">
                <div class="flex items-center justify-between">
                  <p class="notification-title">{{ n.title }}</p>
                  <p class="notification-time">{{ n.time ? (n.time | date:'short') : '' }}</p>
                </div>
                <p class="notification-body">{{ n.body }}</p>
                <div class="notification-actions">
                  <button *ngIf="!n.read" (click)="markRead(n, $event)" class="notification-action-btn">Marquer lu</button>
                  <button (click)="remove(n, $event)" class="notification-action-btn">Supprimer</button>
                </div>
              </div>
            </a>
          </li>
        </ul>
      </ng-container>

    </div>
  </div>
  `
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
