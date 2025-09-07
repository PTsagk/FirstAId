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
import { SendMessageDlgComponent } from '../send-message-dlg/send-message-dlg.component';
import { PreviousMessagesDlgComponent } from '../previous-messages-dlg/previous-messages-dlg.component';
import { PatientMedicalHistoryComponent } from '../patient-medical-history/patient-medical-history.component';

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
  pending: boolean = false;
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
    this.pending = true;
    this.appointmentService
      .updateAppointment(this.appointmentInfo, true)
      .subscribe({
        next: (res: any) => {
          this.appointmentService.refreshAppointments();
          this.snackBar.open('Note saved', '', {
            duration: 2000,
            verticalPosition: 'top',
            panelClass: ['snackbar-success'],
          });
          this.pending = false;
        },
        error: (err) => {
          console.log(err);
          this.pending = false;
        },
      });
  }

  sendMessage(appointmentActive = false): void {
    const dlg = this.dialog.open(SendMessageDlgComponent, {
      width: appointmentActive ? '700px' : '1200px',
      data: {
        appointmentInfo: this.appointmentInfo,
      },
    });
    dlg.componentInstance.appointmentInfo = this.appointmentInfo;
    dlg.componentInstance.appointmentActive = appointmentActive;
  }

  showPreviousMessages(): void {
    const dlg = this.dialog.open(PreviousMessagesDlgComponent, {
      width: '700px',
      data: {
        appointmentInfo: this.appointmentInfo,
      },
    });
  }

  completeAppointment(complete: boolean = true): void {
    if (complete) this.appointmentInfo.status = 'completed';
    else this.appointmentInfo.status = 'pending';
    this.appointmentService
      .updateAppointment(this.appointmentInfo, true)
      .subscribe({
        next: (res: any) => {
          this.appointmentService.refreshAppointments();
          this.snackBar.open('Appointment completed', '', {
            duration: 2000,
            verticalPosition: 'top',
            panelClass: ['snackbar-success'],
          });
          this.appointmentService.refreshAppointments();
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  viewMedicalHistory(): void {
    const dlg = this.dialog.open(PatientMedicalHistoryComponent, {
      width: '90%',
    });

    dlg.componentInstance.medicalHistory =
      this.appointmentInfo.medicalHistory || [];
  }
}
