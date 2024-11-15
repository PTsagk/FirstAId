import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AccountService } from '../../../services/account.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatFormFieldModule,
    CommonModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  @Input() isDoctor: boolean = true;
  constructor(
    private dialogRef: MatDialogRef<LoginComponent>,
    private dialog: MatDialog,
    public accountService: AccountService
  ) {}
  switchUser() {
    this.isDoctor = !this.isDoctor;
  }

  onSubmit(ev: Event) {
    ev.preventDefault();
  }
}
