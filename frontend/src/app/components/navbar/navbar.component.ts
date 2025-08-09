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
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';

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
  undreadCount: number = 0;
  constructor(
    public dialog: MatDialog,
    public accountService: AccountService,
    public router: Router,
    private notificationService: NotificationService,
    private cd: ChangeDetectorRef,
    private http: HttpClient
  ) {
    this.accountService.userInfo
      .pipe(takeUntil(this.destroy$))
      .subscribe((userInfo) => {
        if (userInfo) {
          this.userInfo = userInfo;
          this.notificationService.requestNotificationPermission();

          this.notificationService.connectToNotifications();

          this.notificationService.notifications$.subscribe((notifications) => {
            this.notifications.push(...notifications);
            console.log('New notifications:', notifications);
            this.undreadCount = notifications.filter((n) => !n.read).length;
            this.cd.detectChanges();
          });

          this.http
            .get(environment.api_url + '/notifications', {
              withCredentials: true,
            })
            .subscribe((notifications) => {
              this.notifications = notifications;
              // @ts-ignore
              this.undreadCount = notifications.filter((n) => !n.read).length;
              this.cd.detectChanges();
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
