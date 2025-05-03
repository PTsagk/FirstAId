import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { Appointment } from '../../../models/appointment.model';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-dlg',
  standalone: true,
  imports: [MatDialogActions, MatDialogContent, MatButtonModule, CommonModule],
  templateUrl: './confirmation-dlg.component.html',
  styleUrl: './confirmation-dlg.component.scss',
})
export class ConfirmationDlgComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDlgComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      message?: string;
      confirmButtonText?: string;
      cancelButtonText?: string;
    }
  ) {}
}
