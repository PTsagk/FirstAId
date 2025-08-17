import { Component, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import timelinePlugin from '@fullcalendar/timeline';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import { AppointmentService } from '../../../services/appointment.service';
import moment from 'moment';
import { CreateAppointmentComponent } from '../../components/create-appointment/create-appointment.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ConfirmationDlgComponent } from '../../dialogs/confirmation-dlg/confirmation-dlg.component';
import { AppointmentDetailsDlgComponent } from '../../dialogs/patient-details-dlg/appointment-details-dlg.component';
import { AccountService } from '../../../services/account.service';
import { CalendarOptions } from '@fullcalendar/core';
import rrulePlugin from '@fullcalendar/rrule';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FullCalendarModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {
  appointmentDuration: number = 30;
  workingStartTime: string = '';
  workingEndTime: string = '';
  calendarOptions!: CalendarOptions;
  constructor(
    private appointmentService: AppointmentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private account: AccountService
  ) {
    const userInfo = this.account.userInfo.getValue();
    this.workingStartTime = userInfo.workingStartTime;
    this.workingEndTime = userInfo.workingEndTime;
    this.appointmentDuration = userInfo.appointmentDuration;
    this.calendarOptions = {
      plugins: [
        dayGridPlugin,
        interactionPlugin,
        timeGridPlugin,
        timelinePlugin,
        resourceTimelinePlugin,
        rrulePlugin,
      ],
      initialView: 'dayGridMonth',
      editable: true,
      selectable: true,

      selectMirror: true,

      selectAllow: (selectInfo: any) => {
        const start = moment(selectInfo.start);
        const end = moment(selectInfo.end);

        const sameDay =
          start.isSame(end.clone().subtract(1, 'day'), 'day') ||
          start.isSame(end, 'day');
        const workingDays = this.account.userInfo
          .getValue()
          .workingDays.map((day: string) => {
            return moment().day(day).day();
          });
        const isWorkingDay = workingDays.includes(start.day());

        const isSpecialDate = this.account.userInfo
          .getValue()
          .specialDates.includes(start.format('MM/DD'));

        return sameDay && isWorkingDay && !isSpecialDate;
      },
      select: (info: any) => {
        const selectedDate = moment(info.start).format('YYYY-MM-DD');
        this.dialog.open(CreateAppointmentComponent, {
          width: '500px',
          data: {
            date: selectedDate,
            time: moment(info.start).format('hh:mm A'),
          },
        });
      },
      eventDrop: (info: any) => {
        this.handleEventDrop(info);
      },
      eventClick: (info: any) => {
        if (Object.keys(info.event.extendedProps).length == 0) return;
        const dlg = this.dialog.open(AppointmentDetailsDlgComponent, {
          width: '800px',
          height: '600px',
        });
        dlg.componentInstance.appointmentInfo = { ...info.event.extendedProps };
      },
      events: [],
      height: '100%',
      eventContent: this.renderEventContent,
      headerToolbar: {
        left: 'dayGridMonth,timeGridWeek,timelineDay',
        center: 'title',
        right: 'prev,next today',
      },

      slotMinTime: this.convertTo24HourFormat(this.workingStartTime),
      slotMaxTime: this.convertTo24HourFormat(this.workingEndTime),
      slotDuration: `00:${this.appointmentDuration}:00`,
      businessHours: {
        daysOfWeek: this.account.userInfo
          .getValue()
          .workingDays.map((day: string) => {
            return moment().day(day).day();
          }),
      },
      nowIndicator: true,
    };
  }

  ngOnInit(): void {
    this.appointmentService.appointments.subscribe((appointments: any) => {
      const appointmentEvents = appointments.map((appointment: any) => {
        let color = '#00c450';
        if (appointment.severity === 'emergency') color = 'orange';
        else if (appointment.severity === 'critical') color = '#ff0000';
        // Create a datetime by combining date and time
        const formattedTime = this.convertTo24HourFormat(appointment.time);
        const startDateTimeStr = `${appointment.date}T${formattedTime}`;

        const startMoment = moment(startDateTimeStr);
        const endMoment = moment(startDateTimeStr).add(
          this.appointmentDuration,
          'minutes'
        );
        return {
          title: appointment.fullname,
          date: moment(appointment.date).format('YYYY-MM-DD'),
          start: startMoment.format('YYYY-MM-DDTHH:mm:ss'),
          end: endMoment.format('YYYY-MM-DDTHH:mm:ss'),
          backgroundColor: color,
          borderColor: color,
          display: 'block',
          extendedProps: {
            ...appointment,
          },
        };
      });
      const specialEvents = this.account.userInfo
        .getValue()
        .specialDates.map((date: any) => {
          return {
            title: 'Non working day',
            rrule: {
              freq: 'yearly',
              dtstart: moment(date).format('YYYY-MM-DD'),
            },
            allDay: true,
            backgroundColor: 'gray',
            borderColor: 'gray',
            display: 'block',
            editable: false,
          };
        });
      this.calendarOptions.events = [...appointmentEvents, ...specialEvents];
    });
  }
  renderEventContent(eventInfo: any) {
    const severity = eventInfo.event.extendedProps.severity || '';
    if (!severity) {
      return {
        html: `
          <div class="fc-event-main-container">
            <div class="fc-event-title" >${eventInfo.event.title}</div>
          </div>
        `,
      };
    }
    return {
      html: `
        <div class="fc-event-main-container">
          <div class="fc-event-title">${eventInfo.event.title} ${
        eventInfo.event.extendedProps.status == 'completed'
          ? `
            <i class="fa-solid fa-check"></i>
          `
          : ''
      }</div>
          <div class="fc-event-severity">#${severity}</div>
         
        </div>
      `,
    };
  }

  parseTimeString(time: string): { hour: number; minute: number } {
    let hour = 0;
    let minute = 0;
    const matches = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (matches) {
      hour = parseInt(matches[1]);
      minute = parseInt(matches[2]);
      const period = matches[3].toUpperCase();

      // Adjust hours for PM
      if (period === 'PM' && hour < 12) {
        hour += 12;
      }
      // Adjust midnight (12 AM)
      if (period === 'AM' && hour === 12) {
        hour = 0;
      }
    }
    return { hour, minute };
  }

  convertTo24HourFormat(time: string) {
    const { hour, minute } = this.parseTimeString(time);
    return `${hour.toString().padStart(2, '0')}:${minute
      .toString()
      .padStart(2, '0')}:00`;
  }

  handleEventDrop(info: any) {
    const newDate = moment(info.event.start).format('YYYY-MM-DD');
    const newTime = moment(info.event.start).format('hh:mm A');

    const dialogRef = this.dialog.open(ConfirmationDlgComponent, {
      width: '400px',
      data: {
        message: `Are you sure you want to move the appointment for ${newDate} at ${newTime}?`,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
      },
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        const updatedAppointment = {
          _id: info.event.extendedProps._id,
          date: newDate,
          time: newTime,
          severity: info.event.extendedProps.severity,
          appointmentDuration: info.event.extendedProps.appointmentDuration,
          email: info.event.extendedProps.email,
          doctorId: info.event.extendedProps.doctorId,
          patientId: info.event.extendedProps.patientId,
        };
        this.appointmentService
          .updateAppointment(updatedAppointment)
          .subscribe({
            next: (res: any) => {
              this.snackBar.open('Appointment updated successfuly', '', {
                duration: 2000,
                verticalPosition: 'top',
                panelClass: ['snackbar-success'],
              });
              this.appointmentService.refreshAppointments();
            },
            error: (err: any) => {
              this.snackBar.open(
                'Error updating appointment: ' + err.error,
                '',
                {
                  duration: 3000,
                  verticalPosition: 'top',
                  panelClass: ['snackbar-error'],
                }
              );
              info.revert();
            },
          });
      } else {
        info.revert();
      }
    });
  }
}
