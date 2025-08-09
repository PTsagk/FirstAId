import { ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AccountService } from '../../../services/account.service';
import { NgClass } from '@angular/common';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    NgClass,
    RouterOutlet,
    RouterLink,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnDestroy {
  hideButtons: boolean = false;
  protected destroy$ = new Subject<void>();

  userInfo: any = null;
  notifications: any = [];
  constructor(
    public dialog: MatDialog,
    public accountService: AccountService,
    public router: Router,
    private notificationService: NotificationService,
    private cd: ChangeDetectorRef
  ) {
    this.accountService.userInfo
      .pipe(takeUntil(this.destroy$))
      .subscribe((userInfo) => {
        if (userInfo) {
          this.userInfo = userInfo;
          this.notificationService.requestNotificationPermission();

          // Connect to SSE
          this.notificationService.connectToNotifications();

          // Subscribe to notifications
          this.notificationService.notifications$.subscribe((notifications) => {
            this.notifications = notifications;
            console.log('New notifications:', notifications);
            this.cd.detectChanges();
            // Update UI with new notifications
          });
        }
      });
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/' || event.url === '/home') {
          this.hideButtons = false;
        } else {
          this.hideButtons = true;
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
