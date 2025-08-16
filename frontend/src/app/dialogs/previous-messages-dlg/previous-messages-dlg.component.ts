import { Component, Inject } from '@angular/core';
import { NotificationService } from '../../../services/notification.service';
import { AppointmentService } from '../../../services/appointment.service';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgStyle } from '@angular/common';
import { SendMessageDlgComponent } from '../send-message-dlg/send-message-dlg';
import { Appointment } from '../../../models/appointment.model';

@Component({
  selector: 'app-previous-messages-dlg',
  standalone: true,
  imports: [MatProgressSpinnerModule, NgStyle],
  templateUrl: './previous-messages-dlg.component.html',
  styleUrl: './previous-messages-dlg.component.scss',
})
export class PreviousMessagesDlgComponent {
  appointmentInfo!: Appointment;
  pending: boolean = false;
  messages: any = [];
  constructor(
    private appointmentService: AppointmentService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      appointmentInfo: Appointment;
    }
  ) {
    this.appointmentInfo = data.appointmentInfo;
    this.pending = true;
    this.appointmentService
      .getAppointmentMessages(this.appointmentInfo._id as string)
      .subscribe((messages) => {
        this.messages = messages;
        this.pending = false;
      });
  }

  sendMessage() {
    const dlg = this.dialog.open(SendMessageDlgComponent, {
      width: '500px',
      data: {
        appointmentInfo: this.appointmentInfo,
      },
    });
    dlg.componentInstance.appointmentInfo = this.appointmentInfo;
  }
}
