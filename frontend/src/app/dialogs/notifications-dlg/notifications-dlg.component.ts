import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-notifications-dlg',
  standalone: true,
  imports: [],
  templateUrl: './notifications-dlg.component.html',
  styleUrl: './notifications-dlg.component.scss',
})
export class NotificationsDlgComponent {
  notifications: any[];
  constructor(
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      notifications: any[];
    }
  ) {
    this.notifications = data.notifications.reverse();
  }
  deleteNotification(notificationId: string) {
    this.notificationService
      .deleteNotification(notificationId)
      .subscribe(() => {
        this.notifications = this.notifications.filter(
          (notification) => notification._id !== notificationId
        );
      });
  }
}
