import { Component, ViewChild, ElementRef } from '@angular/core';
import { Appointment } from '../../../models/appointment.model';
import { MatDialog } from '@angular/material/dialog';
import { CreateAppointmentComponent } from '../../components/create-appointment/create-appointment.component';
import { AppointmentService } from '../../../services/appointment.service';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationDlgComponent } from '../confirmation-dlg/confirmation-dlg.component';
import { SendMessageDlgComponent } from '../send-message-dlg/send-message-dlg';

@Component({
  selector: 'app-appointment-details-dlg',
  standalone: true,
  imports: [
    MatInputModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
  ],
  templateUrl: './appointment-details-dlg.component.html',
  styleUrl: './appointment-details-dlg.component.scss',
})
export class AppointmentDetailsDlgComponent {
  @ViewChild('doctorNotes') doctorNotes!: ElementRef<HTMLTextAreaElement>;
  appointmentInfo!: Appointment;
  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private appointmentService: AppointmentService
  ) {}

  async editAppointment() {
    this.dialog.open(CreateAppointmentComponent, {
      width: '500px',
      data: {
        update: true,
        appointmentInfo: this.appointmentInfo,
      },
    });
  }

  async deleteAppointment() {
    const appointmentId = this.appointmentInfo._id;
    const dialogRef = this.dialog.open(ConfirmationDlgComponent, {
      width: '400px',
      data: {
        message: `Are you sure you want to delete this appointment?`,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
      },
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.appointmentService
          .deleteAppointment(appointmentId || '')
          .subscribe({
            next: (res: any) => {
              this.appointmentService.refreshAppointments();
              this.dialog.closeAll();
            },
            error: (err) => {
              console.log(err);
            },
          });
      }
    });
  }

  saveDoctorNotes() {
    if (!this.doctorNotes.nativeElement.value) {
      this.appointmentInfo.doctorNotes = '';
    } else {
      this.appointmentInfo.doctorNotes = this.doctorNotes.nativeElement.value;
    }
    this.appointmentService.updateAppointment(this.appointmentInfo).subscribe({
      next: (res: any) => {
        this.appointmentService.refreshAppointments();
        this.snackBar.open('Note saved', '', {
          duration: 2000,
          verticalPosition: 'top',
          panelClass: ['snackbar-success'],
        });
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  sendMessage(): void {
    const dlg = this.dialog.open(SendMessageDlgComponent, {
      width: '500px',
      data: {
        appointmentInfo: this.appointmentInfo,
      },
    });
    dlg.componentInstance.appointmentInfo = this.appointmentInfo;
  }

  completeAppointment(complete: boolean = true): void {
    if (complete) this.appointmentInfo.status = 'completed';
    else this.appointmentInfo.status = 'pending';
    this.appointmentService.updateAppointment(this.appointmentInfo).subscribe({
      next: (res: any) => {
        this.appointmentService.refreshAppointments();
        this.snackBar.open('Appointment completed', '', {
          duration: 2000,
          verticalPosition: 'top',
          panelClass: ['snackbar-success'],
        });
        this.appointmentService.refreshAppointments();
        this.dialog.closeAll();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
