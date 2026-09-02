import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, map, BehaviorSubject } from 'rxjs';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'NEW' | 'RESOLVED';
  createdAt: string;
}

export interface ContactMessagePayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactMessageResponse {
  success: boolean;
  message: string;
}

const STORAGE_KEY = 'technyks_contact_messages';

const INITIAL_MESSAGES: ContactMessage[] = [
  {
    id: 'msg_1',
    name: 'Aarav Patel',
    email: 'aarav.patel@example.com',
    subject: 'Inquiry regarding n8n AI Automation Engineer course',
    message: 'Hello Technyks team, does this course cover deploying n8n production instances with custom MCP servers on Docker? Looking forward to enrolling.',
    status: 'NEW',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'msg_2',
    name: 'Sarah Jenkins',
    email: 'sarah.j@enterprise-tech.io',
    subject: 'All-Access Annual membership invoice for company reimbursement',
    message: 'Hi, I would like to purchase the All-Access Annual plan. Could you please provide a GST invoice addressed to my organization?',
    status: 'NEW',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  }
];

@Injectable({ providedIn: 'root' })
export class ContactService {
  private http = inject(HttpClient);
  private messagesSubject = new BehaviorSubject<ContactMessage[]>(this.getStoredMessages());

  messages$ = this.messagesSubject.asObservable();

  private getStoredMessages(): ContactMessage[] {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          // fallback
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MESSAGES));
    }
    return INITIAL_MESSAGES;
  }

  private saveStoredMessages(messages: ContactMessage[]) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
    this.messagesSubject.next(messages);
  }

  submitMessage(payload: ContactMessagePayload): Observable<ContactMessageResponse> {
    const newMessage: ContactMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: payload.name,
      email: payload.email,
      subject: payload.subject,
      message: payload.message,
      status: 'NEW',
      createdAt: new Date().toISOString(),
    };

    const current = this.getStoredMessages();
    this.saveStoredMessages([newMessage, ...current]);

    return this.http.post<ContactMessageResponse>('/api/contact', payload).pipe(
      catchError(() => {
        return of({
          success: true,
          message: 'Thanks — your message has been sent to the Technyks Academy team.',
        });
      })
    );
  }

  getMessages(): Observable<ContactMessage[]> {
    return of(this.getStoredMessages());
  }

  toggleMessageStatus(id: string): Observable<boolean> {
    const current = this.getStoredMessages();
    const target = current.find((m) => m.id === id);
    if (target) {
      target.status = target.status === 'NEW' ? 'RESOLVED' : 'NEW';
      this.saveStoredMessages([...current]);
    }
    return of(true);
  }

  deleteMessage(id: string): Observable<boolean> {
    const current = this.getStoredMessages().filter((m) => m.id !== id);
    this.saveStoredMessages([...current]);
    return of(true);
  }
}
