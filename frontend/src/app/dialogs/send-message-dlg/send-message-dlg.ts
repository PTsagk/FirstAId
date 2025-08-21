import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environment/environment';
import { Appointment } from '../../../models/appointment.model';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDialogRef } from '@angular/material/dialog';
import moment from 'moment';
import { AccountService } from '../../../services/account.service';
import { DoctorMessage } from '../../../models/message.model';
import { NotificationService } from '../../../services/notification.service';
import { AssistantService } from '../../../services/assistant.service';

@Component({
  selector: 'app-send-message-dlg',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    NgxMatTimepickerModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
  ],
  templateUrl: './send-message-dlg.component.html',
  styleUrl: './send-message-dlg.component.scss',
})
export class SendMessageDlgComponent implements OnInit {
  appointmentInfo!: Appointment;
  scheduleDateTime!: FormGroup;
  pending: boolean = false;
  // messages: any[] = [
  //   {
  //     role: 'assistant',
  //     content: 'loading',
  //   },
  // ];
  messages: any[] = [];
  constructor(
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SendMessageDlgComponent>,
    private accountService: AccountService,
    private notificationService: NotificationService,
    private assistantService: AssistantService
  ) {}
  ngOnInit(): void {
    this.scheduleDateTime = this.fb.group({
      date: [moment().format('YYYY-MM-DD')],
      time: [moment().format('hh:mm A')],
      message: [''],
    });
  }
  sendMessage(form: FormGroup, message: string) {
    if (!form.valid) return;
    this.pending = true;
    const notification: DoctorMessage = {
      date: moment(form.value.date).format('YYYY-MM-DD'),
      time: form.value.time,
      message: message,
      to: this.appointmentInfo.email,
      from: this.accountService.userInfo.getValue().email,
      doctorNotes: this.appointmentInfo.doctorNotes as string,
      patientNotes: this.appointmentInfo.description as string,
      fullname: this.appointmentInfo.fullname as string,
      appointmentId: this.appointmentInfo._id as string,
      userId: this.appointmentInfo.patientId as string,
      doctorId: this.appointmentInfo.doctorId as string,
      doctorName: this.accountService.userInfo.getValue().name as string,
    };
    this.notificationService
      .sendDoctorMessage(notification)
      .subscribe((res) => {
        this.dialogRef.close();
        this.pending = false;
        this.snackBar.open('Message scheduled', '', {
          duration: 2000,
          verticalPosition: 'top',
          panelClass: ['snackbar-success'],
        });
      });
  }

  generateMessage(helperMessage: string) {
    this.messages.push({ role: 'doctor', content: helperMessage });
    this.messages.push({ role: 'assistant', content: 'loading' });
    this.assistantService
      .generateDoctorMessage(
        helperMessage,
        this.appointmentInfo._id as string,
        this.appointmentInfo.patientId as string
      )
      .subscribe((res: any) => {
        this.messages.pop(); // Remove the 'loading' message
        this.messages.push(
          ...res
            .map((msg: string) => ({
              role: 'assistant',
              content: msg,
            }))
            .filter((msg: any) => msg.content.length > 0)
        );
      });
  }
}
