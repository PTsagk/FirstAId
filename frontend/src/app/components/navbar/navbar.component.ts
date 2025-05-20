import { Component, Input, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AccountService } from '../../../services/account.service';
import { NgClass } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, NgClass],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnDestroy {
  hideButtons: boolean = false;
  protected destroy$ = new Subject<void>();

  userInfo: any = null;
  constructor(
    public dialog: MatDialog,
    public accountService: AccountService,
    private router: Router
  ) {
    this.accountService.userInfo
      .pipe(takeUntil(this.destroy$))
      .subscribe((userInfo) => {
        this.userInfo = userInfo;
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
