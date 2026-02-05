import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Message {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  timestamp: number;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  constructor() {
    this.loadMessages();
  }

  private loadMessages() {
    const savedMessages = localStorage.getItem('messages');
    if (savedMessages) {
      this.messagesSubject.next(JSON.parse(savedMessages));
    }
  }

  private saveMessages() {
    localStorage.setItem('messages', JSON.stringify(this.messagesSubject.value));
  }

  addMessage(message: Omit<Message, 'id' | 'timestamp' | 'read'>): void {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false
    };

    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([newMessage, ...currentMessages]);
    this.saveMessages();
  }

  getMessages(): Message[] {
    return this.messagesSubject.value;
  }

  getUnreadCount(): number {
    return this.messagesSubject.value.filter(m => !m.read).length;
  }

  markAsRead(id: string): void {
    const currentMessages = this.messagesSubject.value.map(m =>
      m.id === id ? { ...m, read: true } : m
    );
    this.messagesSubject.next(currentMessages);
    this.saveMessages();
  }

  markAllAsRead(): void {
    const currentMessages = this.messagesSubject.value.map(m => ({
      ...m,
      read: true
    }));
    this.messagesSubject.next(currentMessages);
    this.saveMessages();
  }

  deleteMessage(id: string): void {
    const currentMessages = this.messagesSubject.value.filter(m => m.id !== id);
    this.messagesSubject.next(currentMessages);
    this.saveMessages();
  }
}
