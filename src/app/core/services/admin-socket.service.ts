import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

/**
 * Real-time companion to AdminService's REST calls. Support tickets are
 * pure REST + one-shot fetch on the client otherwise, so admins never see
 * new customer/worker messages or tickets until they close/reopen the
 * ticket or reload the page. This mirrors the socket wiring already used
 * by customer_app/worker_app.
 */
@Injectable({
  providedIn: 'root',
})
export class AdminSocketService {
  private socket: Socket | null = null;
  private activeSupportTicketId: string | null = null;

  private supportMessage$ = new Subject<{ ticketId: string; message: any }>();
  private supportTicketCreated$ = new Subject<any>();
  private supportStatusChanged$ = new Subject<{ ticketId: string; status: string }>();

  readonly onSupportMessage = this.supportMessage$.asObservable();
  readonly onSupportTicketCreated = this.supportTicketCreated$.asObservable();
  readonly onSupportStatusChanged = this.supportStatusChanged$.asObservable();

  connect(adminId: string): void {
    if (this.socket) {
      this.socket.disconnect();
    }

    const serverUrl = environment.apiUrl.replace(/\/api\/v1\/?$/, '');
    this.socket = io(serverUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on('connect', () => {
      this.socket!.emit('register', { userId: adminId, role: 'admin' });
      // Room membership doesn't survive a reconnect (new socket id on the
      // server), so re-join whichever ticket is currently open.
      if (this.activeSupportTicketId) {
        this.socket!.emit('join-support', { ticketId: this.activeSupportTicketId });
      }
    });

    this.socket.on('support-message', (data: { ticketId: string; message: any }) => {
      this.supportMessage$.next(data);
    });

    this.socket.on('support-ticket-created', (data: any) => {
      this.supportTicketCreated$.next(data);
    });

    this.socket.on('support-status-changed', (data: { ticketId: string; status: string }) => {
      this.supportStatusChanged$.next(data);
    });
  }

  joinSupportTicket(ticketId: string): void {
    this.activeSupportTicketId = ticketId;
    this.socket?.emit('join-support', { ticketId });
  }

  leaveSupportTicket(ticketId: string): void {
    if (this.activeSupportTicketId === ticketId) {
      this.activeSupportTicketId = null;
    }
    this.socket?.emit('leave-support', { ticketId });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.activeSupportTicketId = null;
  }
}
