import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private eventSource: EventSource | null = null;
  private notificationsSubject = new BehaviorSubject<any[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient) {}

  connectToNotifications() {
    if (this.eventSource) {
      this.eventSource.close();
    }

    this.eventSource = new EventSource(
      `${environment.api_url}/notifications/stream`,
      { withCredentials: true }
    );

    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'notification') {
        // Add new notification to the list
        const currentNotifications = this.notificationsSubject.value;
        this.notificationsSubject.next([data.data, ...currentNotifications]);

        // Show browser notification if permission granted
        this.showBrowserNotification(data.data);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
    };
  }

  private showBrowserNotification(notification: any) {
    if (Notification.permission === 'granted') {
      new Notification(notification.title || 'New Notification', {
        body: notification.message,
        icon: '/assets/notification-icon.png',
      });
    }
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  requestNotificationPermission() {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }

  getNotifications() {
    return this.http.get(environment.api_url + '/notifications', {
      withCredentials: true,
    });
  }

  deleteNotification(notificationId: string) {
    return this.http.delete(
      `${environment.api_url}/notifications/${notificationId}`,
      { withCredentials: true }
    );
  }

  sendDoctorMessage(notification: any) {
    return this.http.post(
      environment.api_url + '/notifications/doctor-message',
      notification,
      {
        withCredentials: true,
      }
    );
  }

  sendUserMessage(newMessage: any) {
    return this.http.post(
      `${environment.api_url}/notifications/send-follow-up`,
      newMessage,
      { withCredentials: true }
    );
  }
}
