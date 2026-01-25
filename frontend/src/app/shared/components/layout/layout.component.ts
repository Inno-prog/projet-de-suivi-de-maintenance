import { Component, ViewChild, HostListener, ElementRef, OnDestroy, AfterViewInit, AfterViewChecked, Directive, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { ToastService } from '../../../core/services/toast.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ToastComponent } from '../toast/toast.component';
import { ConfirmationComponent } from '../confirmation/confirmation.component';
import { NotificationBellComponent } from '../notification/notification.component';

// Directive pour détecter les clics à l'extérieur d'un élément
@Directive({
  selector: '[clickOutside]',
  standalone: true
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<MouseEvent>();

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!this.elementRef.nativeElement.contains(target)) {
      this.clickOutside.emit(event);
    }
  }
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SidebarComponent, ToastComponent, ConfirmationComponent, NotificationBellComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./modal-fix.css', './modal-visibility-fix.css'],
  styles: [`
    * {
      box-sizing: border-box;
    }

    .app-layout {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%; /* avoid 100vw which can cause layout shifts with scrollbars */
      height: 100vh;
      display: flex;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }

    app-sidebar {
      flex: 0 0 260px;
      min-width: 260px;
      max-width: 260px;
      height: 100vh;
      overflow-y: auto;
      overflow-x: hidden;
      position: fixed !important;
      left: 0;
      top: 0;
      z-index: 100;
    }

    .main-content {
      flex: 1;
      margin-left: 260px;
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: calc(100% - 260px);
      overflow: hidden;
    }

    .navbar {
      flex: 0 0 64px;
      min-height: 64px;
      max-height: 64px;
      width: 100%;
      background: rgb(28, 82, 118);
      position: relative !important;
      z-index: 50;
    }

    .content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0 40px;
      width: 100%;
      background: #f8fafc;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 64px;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .sidebar-toggle {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: #e2e8f0;
      padding: 0.5rem;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .sidebar-toggle:hover {
      background: rgba(255,255,255,0.1);
    }

    .sidebar-toggle-nav {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: #e2e8f0;
      padding: 0.5rem;
      border-radius: 4px;
      transition: background 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .sidebar-toggle-nav:hover {
      background: rgba(255,255,255,0.1);
    }

    .hamburger {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .hamburger span {
      width: 18px;
      height: 2px;
      background: currentColor;
      transition: all 0.3s ease;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .nav-logo {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 6px;
      background: white;
      object-fit: contain;
    }

    .nav-text h1 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #e2e8f0;
    }

    .nav-user {
      display: flex;
      align-items: center;
    }

    .notification-container {
      margin-right: 0.75rem;
      display: flex;
      align-items: center;
    }

    .profile-section {
      position: relative;
    }

    .profile-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .profile-item:hover {
      background: rgba(255,255,255,0.1);
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: white;
      color: #f97316;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: #e2e8f0;
      margin: 0;
    }

    .user-role {
      font-size: 0.75rem;
      color: #94a3b8;
      margin: 0;
    }

    .dropdown-icon {
      color: #94a3b8;
      transition: transform 0.2s;
    }

    .dropdown-icon.rotated {
      transform: rotate(180deg);
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      right: auto;
      min-width: 280px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      margin-top: 0.5rem;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.2s ease;
    }

    .dropdown-menu.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .profile-dropdown {
      position: absolute;
      top: 100%;
      /* Open the profile dropdown to the left side of the avatar to avoid clipping on the right */
      left: 0;
      right: auto;
      width: 280px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      margin-top: 0.5rem;
    }

    .profile-header {
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      gap: 0.75rem;
    }

    .user-avatar-large {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: white;
      color: #f97316;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.125rem;
    }

    .user-details h4 {
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
    }

    .user-details p {
      margin: 0;
      font-size: 0.875rem;
      color: #64748b;
    }

    .role-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      margin-top: 0.25rem;
    }

    .role-badge.admin {
      background: #fef3c7;
      color: #d97706;
    }

    .role-badge.prestataire {
      background: #dbeafe;
      color: #2563eb;
    }

    .role-badge.agent {
      background: #dcfce7;
      color: #16a34a;
    }

    .profile-menu {
      padding: 0.5rem 0;
    }

    .profile-form-content {
      padding: 1.25rem;
    }

    .profile-form-content .form-group {
      margin-bottom: 0.75rem;
    }

    .profile-form-content .form-group label {
      display: block;
      font-size: 0.75rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.25rem;
    }

    .profile-form-content .form-control {
      width: 100%;
      padding: 0.5rem;
      font-size: 0.875rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: white;
      color: #1e293b;
    }

    .profile-form-content .form-control:focus {
      outline: none;
      border-color: #f97316;
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    }

    .profile-form-content .checkbox-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .profile-form-content .checkbox-group input[type="checkbox"] {
      width: 16px;
      height: 16px;
    }

    .profile-form-content .checkbox-group label {
      margin: 0;
      font-size: 0.875rem;
      color: #374151;
    }

    .profile-form-content .form-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      padding-top: 0.5rem;
      border-top: 1px solid #e2e8f0;
      margin-top: 0.5rem;
    }

    .profile-form-content .form-actions .btn {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      width: 100%;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      color: #374151;
      transition: background 0.2s;
    }

    .menu-item:hover {
      background: #f9fafb;
    }

    .menu-item.logout {
      color: #dc2626;
    }

    .menu-item.logout:hover {
      background: #fef2f2;
    }

    .menu-icon {
      width: 16px;
      height: 16px;
    }

    .menu-divider {
      height: 1px;
      background: #e5e7eb;
      margin: 0.5rem 0;
    }



    .modal-overlay {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      background: rgba(0,0,0,0.5) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 9999 !important;
      visibility: visible !important;
      opacity: 1 !important;
    }

    .modal {
      background: white !important;
      border: 2px solid #1e293b !important;
      border-radius: 8px !important;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3) !important;
      max-width: 500px !important;
      width: 90% !important;
      max-height: 90vh !important;
      min-height: 400px !important;
      overflow-y: auto !important;
      visibility: visible !important;
      opacity: 1 !important;
      z-index: 10000 !important;
    }

    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: #64748b;
      padding: 0.25rem;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .close-btn:hover {
      background: #f1f5f9;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .profile-avatar-section {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .profile-avatar-large {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: white;
      color: #f97316;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.5rem;
      margin: 0 auto 1rem auto;
    }

    .profile-avatar-section h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
    }

    .profile-avatar-section p {
      margin: 0;
      color: #64748b;
      font-size: 0.875rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.875rem;
      transition: border-color 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #f97316;
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    }

    .modal-footer {
      padding: 1.5rem;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .btn-secondary {
      background: #f1f5f9;
      color: #64748b;
    }

    .btn-secondary:hover {
      background: #e2e8f0;
    }

    .btn-primary {
      background: #f97316;
      color: white;
    }

    .btn-primary:hover {
      background: #ea580c;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Inline profile and settings dropdown styles */
    .profile-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: auto;
      min-width: 320px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      margin-top: 0.5rem;
      overflow: visible;
    }

    .profile-details-dropdown,
    .profile-edit-dropdown,
    .settings-edit-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: auto;
      min-width: 360px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      margin-top: 0.5rem;
      overflow: visible;
    }

    .profile-details-content {
      padding: 0;
    }

    .profile-info-display {
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .profile-avatar-section {
      text-align: center;
      margin-bottom: 1rem;
    }

    .profile-avatar-large {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: white;
      color: #f97316;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.25rem;
      margin: 0 auto 0.5rem auto;
      border: 2px solid #f97316;
    }

    .profile-avatar-section h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
    }

    .profile-avatar-section p {
      margin: 0 0 0.5rem 0;
      color: #64748b;
      font-size: 0.875rem;
    }

    .profile-details-compact {
      margin-bottom: 0.75rem;
      padding: 0 1.25rem;
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      color: #64748b;
      margin-bottom: 0.25rem;
    }

    .detail-row:last-child {
      margin-bottom: 0;
    }

    .detail-compact {
      color: #64748b;
      font-size: 0.75rem;
      word-break: break-word;
      line-height: 1.2;
    }

    .detail-separator {
      color: #cbd5e1;
      font-size: 0.75rem;
      margin: 0 0.25rem;
    }

    .profile-details-list {
      margin-bottom: 1rem;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .detail-item:last-child {
      border-bottom: none;
    }

    .detail-label {
      font-weight: 500;
      color: #64748b;
      font-size: 0.875rem;
    }

    .detail-value {
      color: #1e293b;
      font-size: 0.875rem;
      text-align: right;
      max-width: 60%;
      word-break: break-word;
    }

    .profile-actions {
      text-align: center;
    }

    .profile-edit-section {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .edit-section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .edit-section-header h4 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .w-full {
      width: 100%;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    .settings-display {
      padding: 0.75rem 1.25rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .settings-section {
      border-bottom: 1px solid #e2e8f0;
    }

    .settings-display h4 {
      margin: 0 0 0.75rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .settings-list {
      margin-bottom: 0.75rem;
    }

    .setting-item-display {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.375rem 0;
      font-size: 0.875rem;
      color: #374151;
    }

    .setting-item-display i {
      margin-right: 0.5rem;
      width: 16px;
      color: #64748b;
    }

    .setting-status {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      background: #f1f5f9;
      color: #64748b;
    }

    .setting-status.enabled {
      background: #dcfce7;
      color: #16a34a;
    }

    .setting-value {
      color: #1e293b;
      font-weight: 500;
    }

    .settings-actions {
      text-align: center;
    }

    .profile-form-header,
    .settings-form-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      border-radius: 8px 8px 0 0;
    }

    .profile-form-header h4,
    .settings-form-header h4 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .close-form-btn {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: #64748b;
      padding: 0.25rem;
      border-radius: 4px;
      transition: background 0.2s;
      line-height: 1;
    }

    .close-form-btn:hover {
      background: #e2e8f0;
      color: #1e293b;
    }

    .profile-edit-dropdown form,
    .settings-content {
      padding: 1.25rem;
    }

    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.75rem;
    }

    .form-row .form-group {
      flex: 1;
      margin-bottom: 0;
    }

    .form-row.single {
      display: block;
    }

    .form-row.single .form-group {
      width: 100%;
    }

    .form-group label {
      display: block;
      font-size: 0.75rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.25rem;
    }

    .form-group .form-control {
      width: 100%;
      padding: 0.5rem;
      font-size: 0.875rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: white;
      color: #1e293b;
    }

    .form-group .form-control:focus {
      outline: none;
      border-color: #f97316;
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    }

    .form-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
      margin-top: 0.5rem;
    }

    .form-actions .btn {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    /* Switch toggle for settings */
    .switch {
      position: relative;
      display: inline-block;
      width: 40px;
      height: 20px;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .4s;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 14px;
      width: 14px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .4s;
    }

    input:checked + .slider {
      background-color: #f97316;
    }

    input:checked + .slider:before {
      transform: translateX(20px);
    }

    .slider.round {
      border-radius: 20px;
    }

    .slider.round:before {
      border-radius: 50%;
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .setting-item:last-child {
      border-bottom: none;
    }

    .setting-info {
      flex: 1;
    }

    .setting-info label {
      display: block;
      font-weight: 500;
      color: #1e293b;
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }

    .setting-info p {
      margin: 0;
      font-size: 0.75rem;
      color: #64748b;
    }

    .lang-select {
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.875rem;
      background: white;
      min-width: 120px;
    }

    /* New compact profile section styles */
    .profile-section-compact {
      border-bottom: 1px solid #e2e8f0;
    }

    .profile-header-compact {
      padding: 1rem 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      transition: background 0.2s;
    }

    .profile-header-compact:hover {
      background: #f8fafc;
    }

    .user-info-compact {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar-small {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: white;
      color: #f97316;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
      border: 2px solid #f97316;
    }

    .user-details-compact {
      display: flex;
      flex-direction: column;
    }

    .user-name-compact {
      font-size: 0.875rem;
      font-weight: 500;
      color: #1e293b;
      margin: 0;
    }

    .user-email-compact {
      font-size: 0.75rem;
      color: #64748b;
      margin: 0;
    }

    .btn-details-toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: none;
      border: none;
      color: #64748b;
      font-size: 0.875rem;
      cursor: pointer;
      transition: color 0.2s;
    }

    .btn-details-toggle:hover {
      color: #1e293b;
    }

    .btn-details-toggle.expanded i {
      transform: rotate(180deg);
    }

    .profile-details-expanded {
      border-top: 1px solid #f1f5f9;
      background: #f8fafc;
      animation: slideDown 0.2s ease-out;
    }

    .profile-details-content {
      padding: 1rem 1.25rem;
    }

    .role-display {
      margin-top: 0.5rem;
    }

    /* Profile management section */
    .profile-management-section {
      border-bottom: 1px solid #e2e8f0;
    }

    .section-header {
      padding: 1rem 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .section-header h4 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* Settings and logout section */
    .settings-logout-section {
      background: #f8fafc;
    }

    .logout-section {
      padding: 0.75rem 1.25rem 1.25rem 1.25rem;
    }

    .profile-menu {
      padding: 0.75rem 1.25rem;
      background: #f8fafc;
      border-radius: 0 0 8px 8px;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      width: 100%;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      color: #374151;
      transition: background 0.2s;
      border-radius: 6px;
    }

    .menu-item:hover {
      background: #f1f5f9;
    }

    .menu-item.logout {
      color: #dc2626;
    }

    .menu-item.logout:hover {
      background: #fef2f2;
    }

    .menu-icon {
      width: 16px;
      height: 16px;
    }

    /* Section expand animation */
    .profile-section.expanded .profile-details-dropdown,
    .profile-section.expanded .profile-edit-dropdown,
    .profile-section.expanded .settings-edit-dropdown {
      animation: slideDown 0.2s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }


  `]
})
export class LayoutComponent implements AfterViewInit, OnDestroy {
  @ViewChild('sidebar') sidebar!: SidebarComponent;
  @ViewChild('toast') toast!: ToastComponent;
  @ViewChild('confirmation') confirmation!: ConfirmationComponent;

  currentUser: any;
  sidebarOpen = true;
  profileMenuOpen = false;
  showProfileModal = false;
  showSettingsModal = false;
  profileLoading = false;
  isMobile = false;
  
  // Dropdown inline form states (used in template for inline profile/settings forms)
  showProfileForm = false;
  showSettingsForm = false;
  
  // Inline editing states - profile and settings details displayed inline with edit capability
  isEditingProfile = false;
  isEditingSettings = false;

  // Settings properties
  darkMode = false;
  language = 'fr'; // 'fr' for French, 'en' for English

  // Profile details expansion state
  showProfileDetails = false;

  // Prevent sidebar from being closed on desktop, allow on mobile
  private preventSidebarClose = true;

  profileForm: FormGroup;

  private routerEventsSub?: Subscription;
  private stabilizeInterval?: any;
  private layoutObserver?: MutationObserver;

  constructor(private fb: FormBuilder, public authService: AuthService, private confirmationService: ConfirmationService, private toastService: ToastService, private elementRef: ElementRef, private router: Router) {
    this.currentUser = this.authService.getCurrentUser();
    this.checkScreenSize();
    console.log('LayoutComponent - Initial sidebarOpen:', this.sidebarOpen, 'isMobile:', this.isMobile);
    this.profileForm = this.fb.group({
      nom: [this.currentUser?.nom || ''],
      email: [this.currentUser?.email || ''],
      contact: [''],
      adresse: [''],
      // Prestataire-specific fields
      structure: [''],
      direction: [''],
      qualification: ['']
    });

    // Initialize settings from localStorage
    this.initSettings();

  // Stabiliser le layout immédiatement (single pass). Avoid periodic inline style mutations.
  setTimeout(() => this.stabilizeLayout(), 0);

    // Initialize services
    setTimeout(() => {
      if (this.toast) {
        this.toastService.setComponent(this.toast);
      }
      if (this.confirmation) {
        this.confirmationService.setComponent(this.confirmation);
      }
    });

    // Close profile menu when navigating
    this.routerEventsSub = this.router.events.subscribe((ev: any) => {
      this.profileMenuOpen = false;
    });
  }

  // Initialize settings from localStorage
  private initSettings(): void {
    // Dark mode
    const savedDarkMode = localStorage.getItem('darkMode');
    this.darkMode = savedDarkMode === 'true';
    this.applyDarkMode();

    // Language
    const savedLanguage = localStorage.getItem('language');
    this.language = savedLanguage || 'fr';
    this.applyLanguage();
  }

  // Toggle dark mode
  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', this.darkMode.toString());
    this.applyDarkMode();
  }

  // Apply dark mode styles
  private applyDarkMode(): void {
    if (this.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  // Change language
  changeLanguage(lang: string): void {
    this.language = lang;
    localStorage.setItem('language', lang);
    this.applyLanguage();
  }

  // Apply language changes
  private applyLanguage(): void {
    // For now, we just update the UI - in a real app, we would use a translation service
    console.log('Language changed to:', this.language);
  }

  // Get language label
  getLanguageLabel(): string {
    return this.language === 'fr' ? 'Français' : 'English';
  }

  // Get dark mode status
  getDarkModeStatus(): string {
    return this.darkMode ? 'Activé' : 'Désactivé';
  }

  ngOnDestroy(): void {
    this.routerEventsSub?.unsubscribe();
    // Clear observer and any periodic watchdog
    if (this.layoutObserver) {
      try { this.layoutObserver.disconnect(); } catch (e) { /* ignore */ }
      this.layoutObserver = undefined;
    }
    if (this.stabilizeInterval) {
      try { clearInterval(this.stabilizeInterval); } catch (e) { /* ignore */ }
      this.stabilizeInterval = undefined;
    }
  }

  ngAfterViewInit(): void {
    // Stabiliser le layout immédiatement
    this.stabilizeLayout();

    // Observe DOM mutations and re-apply the stable-layout class and
    // visibility styles in case something (third-party code or a bug)
    // removes them at runtime. This ensures the sidebar/navbar do not
    // disappear unexpectedly during a session.
    try {
      this.layoutObserver = new MutationObserver(() => {
        try {
          const root = document.querySelector('.app-layout');
          if (root && !root.classList.contains('stable-layout')) {
            root.classList.add('stable-layout');
            this.updateNavbarCssVars();
            console.log('LayoutComponent - MutationObserver: re-added stable-layout');
          }

          const sidebarEl = document.querySelector('app-sidebar') as HTMLElement | null;
          if (sidebarEl) {
            sidebarEl.style.display = 'block';
            sidebarEl.style.visibility = 'visible';
            sidebarEl.style.opacity = '1';
          }
          const navbarEl = document.querySelector('.navbar') as HTMLElement | null;
          if (navbarEl) {
            navbarEl.style.display = 'block';
            navbarEl.style.visibility = 'visible';
            navbarEl.style.opacity = '1';
          }
        } catch (e) {
          // ignore per-observer errors
        }
      });

      this.layoutObserver.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['class', 'style'] });
    } catch (e) {
      console.warn('LayoutComponent - failed to init MutationObserver', e);
    }

    // Lightweight watchdog: occasional check to recover layout after long idle periods.
    try {
      this.stabilizeInterval = setInterval(() => {
        try {
          if (typeof document === 'undefined' || document.visibilityState !== 'visible') return;
          const root = document.querySelector('.app-layout');
          if (root && !root.classList.contains('stable-layout')) {
            root.classList.add('stable-layout');
            this.updateNavbarCssVars();
            console.log('LayoutComponent - Watchdog: reapplied stable-layout');
          }

          const sidebarEl = document.querySelector('app-sidebar') as HTMLElement | null;
          if (sidebarEl) {
            const cs = getComputedStyle(sidebarEl);
            if (sidebarEl.style.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') {
              sidebarEl.style.display = 'block';
              sidebarEl.style.visibility = 'visible';
              sidebarEl.style.opacity = '1';
              console.log('LayoutComponent - Watchdog: restored sidebar visibility');
            }
          }

          const navbarEl = document.querySelector('.navbar') as HTMLElement | null;
          if (navbarEl) {
            const csNav = getComputedStyle(navbarEl);
            if (navbarEl.style.display === 'none' || csNav.visibility === 'hidden' || csNav.opacity === '0') {
              navbarEl.style.display = 'block';
              navbarEl.style.visibility = 'visible';
              navbarEl.style.opacity = '1';
              console.log('LayoutComponent - Watchdog: restored navbar visibility');
            }
          }
        } catch (e) {
          // swallow
        }
      }, 15000);
    } catch (e) {
      // ignore if interval not permitted
    }
  }

  private stabilizeLayout(): void {
    // Prefer CSS class based stabilization to avoid frequent inline style mutations.
    // The `.stable-layout` class (defined in styles.css) enforces fixed sidebar/navbar
    // and correct offsets. We also update navbar-dependent CSS variables.
    try {
      const root = document.querySelector('.app-layout');
      if (root && !root.classList.contains('stable-layout')) {
        root.classList.add('stable-layout');
      }
      // Update CSS variables (navbar height) for accurate layout
      this.updateNavbarCssVars();
    } catch (e) {
      console.warn('stabilizeLayout: failed to apply stable-layout class', e);
    }
  }



  toggleSidebar() {
    console.log('LayoutComponent - toggleSidebar called. isMobile:', this.isMobile, 'current sidebarOpen:', this.sidebarOpen);
    // Toggle state; respect preventSidebarClose on desktop
    this.sidebarOpen = !this.sidebarOpen;
    if (this.preventSidebarClose && !this.isMobile && !this.sidebarOpen) {
      // restore open state on desktop
      this.sidebarOpen = true;
      console.log('LayoutComponent - prevented closing sidebar on desktop');
    }
    if (this.sidebar) {
      this.sidebar.isOpen = this.sidebarOpen;
    }
  }

  onSidebarToggle(isOpen: boolean) {
    console.log('LayoutComponent - onSidebarToggle called with isOpen:', isOpen, 'current isMobile:', this.isMobile);
    if (this.preventSidebarClose && !this.isMobile && !isOpen) {
      this.sidebarOpen = true;
      if (this.sidebar) this.sidebar.isOpen = true;
      console.log('LayoutComponent - prevented sidebar close on desktop');
      return;
    }
    this.sidebarOpen = isOpen;
    if (this.sidebar) this.sidebar.isOpen = isOpen;
  }

  getUserInitials(): string {
    if (!this.currentUser?.nom) return '';
    return this.currentUser.nom.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  }

  toggleProfileMenu() {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  toggleProfileDetails() {
    this.showProfileDetails = !this.showProfileDetails;
  }

  closeProfileMenu() {
    this.profileMenuOpen = false;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = (event as any).target as Node;
    if (!this.elementRef.nativeElement.contains(target)) {
      // Close profile menu when clicking outside
      this.profileMenuOpen = false;
      this.isEditingProfile = false;
      this.isEditingSettings = false;
    }
  }

  /**
   * Close dropdown when clicking on the main content area
   */
  onLayoutClick() {
    this.profileMenuOpen = false;
    this.isEditingProfile = false;
    this.isEditingSettings = false;
  }

  /**
   * UI-level session activity check. Returns true as long as the user is
   * authenticated OR was authenticated within the last hour (grace period).
   * This prevents transient auth falsey values from immediately hiding the layout.
   */
  isSessionActive(graceMs: number = 60 * 60 * 1000): boolean {
    if (this.authService.isAuthenticated()) return true;
    if (!this.authService.lastAuthenticatedAt) return false;
    return (Date.now() - this.authService.lastAuthenticatedAt) < graceMs;
  }

  private checkScreenSize() {
    const previousIsMobile = this.isMobile;
    const previousSidebarOpen = this.sidebarOpen;
    this.isMobile = window.innerWidth <= 768;
    // Always keep sidebar open for debugging - will be visible regardless of screen size
    this.sidebarOpen = true;
    // Keep CSS variables up-to-date when screen size changes
    this.updateNavbarCssVars();

    if (previousIsMobile !== this.isMobile || previousSidebarOpen !== this.sidebarOpen) {
      console.log('LayoutComponent - Screen size changed. isMobile:', this.isMobile, 'sidebarOpen:', this.sidebarOpen, 'window.innerWidth:', window.innerWidth);
    }
  }

  /** Measure the actual navbar height and write CSS variables so styles can
   * adapt (modal offsets, main-content padding, etc.). Called on init and
   * on resize.
   */
  private updateNavbarCssVars(): void {
    try {
      const navbar = document.querySelector('.navbar') as HTMLElement | null;
      const root = document.documentElement;
      if (navbar && root) {
        const rect = navbar.getBoundingClientRect();
        const height = Math.round(rect.height) || 64;
        root.style.setProperty('--app-navbar-height', `${height}px`);
        // Provide a reasonable overlay gap; can be adjusted later if needed
        root.style.setProperty('--app-overlay-gap', `16px`);
      }
    } catch (e) {
      // ignore
      console.warn('Could not update navbar CSS variables', e);
    }
  }

  openProfileModal() {
    // Refresh current user data
    this.currentUser = this.authService.getCurrentUser();
    // Update form with current user data
    this.profileForm.patchValue({
      nom: this.currentUser?.nom || '',
      email: this.currentUser?.email || '',
      contact: this.currentUser?.contact || '',
      adresse: this.currentUser?.adresse || '',
      // Prestataire-specific fields
      structure: this.currentUser?.structure || '',
      direction: this.currentUser?.direction || '',
      qualification: this.currentUser?.qualification || ''
    });
    this.showProfileModal = true;
    this.closeProfileMenu();
    
    // Force modal visibility
    this.forceModalVisibility();
  }

  openSettingsModal() {
    this.showSettingsModal = true;
    this.closeProfileMenu();
    
    // Force modal visibility
    this.forceModalVisibility();
  }

  logout() {
    console.log('LayoutComponent: Bouton de déconnexion cliqué');
    this.authService.logout();
  }

  getRoleLabel(role?: string): string {
    const r = role || this.currentUser?.role;
    switch (r) {
      case 'ADMINISTRATEUR': return 'Administrateur';
      case 'PRESTATAIRE': return 'Prestataire';
      case 'AGENT_DGSI': return 'Agent DGSI';
      default: return r || '';
    }
  }

  getRoleClass(): string {
    const role = this.currentUser?.role;
    switch (role) {
      case 'ADMINISTRATEUR': return 'admin';
      case 'PRESTATAIRE': return 'prestataire';
      case 'AGENT_DGSI': return 'agent';
      default: return '';
    }
  }

  updateProfile() {
    if (this.profileForm.valid) {
      this.profileLoading = true;
      const profileData = this.profileForm.value;

      this.authService.updateUserProfile(profileData).subscribe({
        next: (updatedUser) => {
          this.profileLoading = false;
          this.closeProfileModal();
          this.currentUser = updatedUser; // Update local currentUser
          this.toastService.show({ type: 'success', title: 'Succès', message: 'Profil mis à jour avec succès' });
        },
        error: (error) => {
          this.profileLoading = false;
          console.error('Error updating profile:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la mise à jour du profil' });
        }
      });
    }
  }

  closeProfileModal() {
    this.showProfileModal = false;
  }

  closeSettingsModal() {
    this.showSettingsModal = false;
  }

  /**
   * Save settings from the inline settings form in dropdown
   */
  saveSettings(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    // For now, just show a success message as settings are local preferences
    this.toastService.show({ type: 'success', title: 'Succès', message: 'Paramètres enregistrés avec succès' });
    this.showSettingsForm = false;
  }

  // Inline editing methods for profile and settings
  toggleEditProfile() {
    this.isEditingProfile = !this.isEditingProfile;
    if (this.isEditingProfile) {
      // Pre-fill form with current user data when entering edit mode
      this.profileForm.patchValue({
        nom: this.currentUser?.nom || '',
        email: this.currentUser?.email || '',
        contact: this.currentUser?.contact || '',
        adresse: this.currentUser?.adresse || '',
        structure: this.currentUser?.structure || '',
        direction: this.currentUser?.direction || '',
        qualification: this.currentUser?.qualification || ''
      });
    }
  }

  toggleEditSettings() {
    this.isEditingSettings = !this.isEditingSettings;
  }

  cancelEditProfile() {
    this.isEditingProfile = false;
  }

  cancelEditSettings() {
    this.isEditingSettings = false;
  }

  saveInlineProfile() {
    if (this.profileForm.valid) {
      this.profileLoading = true;
      const profileData = this.profileForm.value;

      this.authService.updateUserProfile(profileData).subscribe({
        next: (updatedUser) => {
          this.profileLoading = false;
          this.isEditingProfile = false;
          this.currentUser = updatedUser;
          this.toastService.show({ type: 'success', title: 'Succès', message: 'Profil mis à jour avec succès' });
        },
        error: (error) => {
          this.profileLoading = false;
          console.error('Error updating profile:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la mise à jour du profil' });
        }
      });
    }
  }

  saveInlineSettings(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.toastService.show({ type: 'success', title: 'Succès', message: 'Paramètres enregistrés avec succès' });
    this.isEditingSettings = false;
  }

  /**
   * Force la visibilité des modals en cas de problème d'affichage
   */
  private forceModalVisibility(): void {
    setTimeout(() => {
      const modals = document.querySelectorAll('.modal-overlay, .modal, .modal-content');
      modals.forEach(modal => {
        const element = modal as HTMLElement;
        element.style.display = 'flex';
        element.style.visibility = 'visible';
        element.style.opacity = '1';
        element.style.zIndex = '9999';
      });
    }, 50);
  }

  /**
   * Public wrapper so the template can trigger toast messages without
   * accessing the private toastService directly.
   */
  showDemoMessage(message: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    try {
      this.toastService.show({ type: 'info', title: 'Info', message });
    } catch (e) {
      // If toast service isn't available yet, ignore silently.
      console.warn('Toast service unavailable for demo message', e);
    }
  }
}
