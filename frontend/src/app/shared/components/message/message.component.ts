import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService, Message } from '../../../core/services/message.service';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {
  open = false;
  messages: Message[] = [];
  unreadCount = 0;

  constructor(private messageService: MessageService) { }

  ngOnInit(): void {
    this.messageService.messages$.subscribe(messages => {
      this.messages = messages;
      this.unreadCount = this.messageService.getUnreadCount();
    });
  }

  toggle(): void {
    this.open = !this.open;
    if (this.open) {
      // Mark all messages as read when opening the dropdown
      this.messageService.markAllAsRead();
    }
  }

  close(): void {
    this.open = false;
  }

  deleteMessage(id: string, event: Event): void {
    event.stopPropagation();
    this.messageService.deleteMessage(id);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('app-message')) {
      this.close();
    }
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Aujourd\'hui';
    } else if (diffDays === 2) {
      return 'Hier';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} jours ago`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  }
}
