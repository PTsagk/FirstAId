import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

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
    @Inject(MAT_DIALOG_DATA)
    public data: {
      notifications: any[];
    }
  ) {
    this.notifications = data.notifications.reverse();
  }
}
