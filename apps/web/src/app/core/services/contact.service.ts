import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  of,
  tap,
  throwError,
} from 'rxjs';

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
  id?: string;
}

const STORAGE_KEY = 'technyks_contact_messages';

const INITIAL_MESSAGES: ContactMessage[] = [];

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

    return this.http.post<ContactMessageResponse>('/api/contact', payload).pipe(
      tap((response) => {
        newMessage.id = response.id || newMessage.id;
        const current = this.getStoredMessages().filter(
          (message) => message.id !== newMessage.id,
        );
        this.saveStoredMessages([newMessage, ...current]);
      }),
      catchError((error) => {
        if (!this.isApiUnavailable(error)) return throwError(() => error);
        const current = this.getStoredMessages();
        this.saveStoredMessages([newMessage, ...current]);
        return of({
          success: true,
          message:
            'Your message is saved in this browser. Please retry when the server connection is restored.',
        });
      })
    );
  }

  getMessages(): Observable<ContactMessage[]> {
    return this.http.get<ContactMessage[]>('/api/admin/contacts').pipe(
      map((messages): ContactMessage[] =>
        messages.map((message) => ({
          ...message,
          status:
            message.status === 'RESOLVED'
              ? ('RESOLVED' as const)
              : ('NEW' as const),
        })),
      ),
      tap((messages) => this.saveStoredMessages(messages)),
      catchError((error) =>
        this.isApiUnavailable(error)
          ? of(this.getStoredMessages())
          : throwError(() => error),
      ),
    );
  }

  toggleMessageStatus(id: string): Observable<boolean> {
    const current = this.getStoredMessages();
    const target = current.find((m) => m.id === id);
    if (!target) return of(false);
    const status = target.status === 'NEW' ? 'RESOLVED' : 'NEW';

    return this.http
      .patch<ContactMessage>(`/api/admin/contacts/${encodeURIComponent(id)}`, {
        status,
      })
      .pipe(
        tap((saved) => {
          this.saveStoredMessages(
            current.map((message) =>
              message.id === id ? { ...message, ...saved } : message,
            ),
          );
        }),
        map(() => true),
        catchError((error) => {
          if (!this.isApiUnavailable(error)) return throwError(() => error);
          target.status = status;
          this.saveStoredMessages([...current]);
          return of(true);
        }),
      );
  }

  deleteMessage(id: string): Observable<boolean> {
    return this.http
      .delete<{ success: boolean }>(
        `/api/admin/contacts/${encodeURIComponent(id)}`,
      )
      .pipe(
        tap(() => this.removeStoredMessage(id)),
        map(() => true),
        catchError((error) => {
          if (!this.isApiUnavailable(error)) return throwError(() => error);
          this.removeStoredMessage(id);
          return of(true);
        }),
      );
  }

  private removeStoredMessage(id: string) {
    this.saveStoredMessages(
      this.getStoredMessages().filter((message) => message.id !== id),
    );
  }

  private isApiUnavailable(error: any): boolean {
    return (
      error?.status === 0 ||
      error?.status === 404 ||
      error?.status === 502 ||
      error?.status === 503 ||
      error?.status === 504 ||
      (error?.status === 200 &&
        /parse|json/i.test(String(error?.message || '')))
    );
  }
}
