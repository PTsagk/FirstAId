import { Component, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import timelinePlugin from '@fullcalendar/timeline';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import { AppointmentService } from '../../../services/appointment.service';
import moment from 'moment';
import { start } from '@popperjs/core';
import { CreateAppointmentComponent } from '../../components/create-appointment/create-appointment.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  formatDayString,
  formatIsoTimeString,
} from '@fullcalendar/core/internal';
@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FullCalendarModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {
  constructor(
    private appointmentService: AppointmentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}
  calendarOptions = {
    plugins: [
      dayGridPlugin,
      interactionPlugin,
      timeGridPlugin,
      timelinePlugin,
      resourceTimelinePlugin,
    ],
    initialView: 'timelineDay',
    editable: true,
    selectable: true,

    selectMirror: true,
    selectAllow: (info: any) => {
      return moment(info.start).isSame(
        moment(info.end).subtract(1, 'day'),
        'day'
      );
    },
    select: (info: any) => {
      const selectedDate = moment(info.start).format('YYYY-MM-DD');
      this.dialog.open(CreateAppointmentComponent, {
        width: '500px',
        data: {
          appointmentDate: selectedDate,
        },
      });
    },
    eventDrop: (info: any) => {
      this.handleEventDrop(info);
    },
    events: [],
    height: '100%',
    eventContent: this.renderEventContent,
    headerToolbar: {
      left: 'dayGridMonth,timeGridWeek,timelineDay',
      center: 'title',
      right: 'prev,next today',
    },
    slotMinTime: '08:00:00', // Start time for the day
    slotMaxTime: '18:00:00', // End time for the day
    slotDuration: '00:30:00', // 30-minute slots
    nowIndicator: true,
  };

  ngOnInit(): void {
    this.appointmentService.appointments.subscribe((appointments: any) => {
      this.calendarOptions.events = appointments.map((appointment: any) => {
        let color = '#00c450';
        if (appointment.severity === 'emergency') color = 'orange';
        else if (appointment.severity === 'critical') color = '#ff0000';
        // Create a datetime by combining date and time
        const formattedTime = this.convertTo24HourFormat(
          appointment.appointmentTime
        );
        const startDateTimeStr = `${appointment.appointmentDate}T${formattedTime}`;

        const startMoment = moment(startDateTimeStr);
        const endMoment = moment(startDateTimeStr).add(30, 'minutes');
        return {
          title: appointment.fullname,
          date: moment(appointment.appointmentDate).format('YYYY-MM-DD'),
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
    });
  }
  renderEventContent(eventInfo: any) {
    const severity = eventInfo.event.extendedProps.severity || '';

    return {
      html: `
        <div class="fc-event-main-container">
          <div class="fc-event-title">${eventInfo.event.title}</div>
          <div class="fc-event-severity">#${severity}</div>
        </div>
      `,
    };
  }
  // handleDateSelect(selectInfo: any) {
  //   const title = prompt('Enter event title:');
  //   const calendarApi = selectInfo.view.calendar;

  //   calendarApi.unselect();

  //   if (title) {
  //     calendarApi.addEvent({
  //       title,
  //       start: selectInfo.startStr,
  //       end: selectInfo.endStr,
  //       allDay: selectInfo.allDay,
  //     });
  //   }
  // }
  convertTo24HourFormat(time: string) {
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
    return `${hour.toString().padStart(2, '0')}:${minute
      .toString()
      .padStart(2, '0')}:00`;
  }

  handleEventDrop(info: any) {
    // Get the updated dates/times from the event
    // const eventTitle = info.event.title;
    // const newStart = moment(info.event.start).format('YYYY-MM-DDHH:mm:ss');
    // const newEnd = info.event.end
    //   ? moment(info.event.end).format('YYYY-MM-DDTHH:mm:ss')
    //   : null;

    // Extract just the date and time parts
    const newDate = moment(info.event.start).format('YYYY-MM-DD');
    const newTime = moment(info.event.start).format('hh:mm A');
    const updatedAppointment = { ...info.event.extendedProps };
    updatedAppointment.appointmentDate = newDate;
    updatedAppointment.appointmentTime = newTime;
    this.appointmentService.updateAppointment(updatedAppointment).subscribe({
      next: (res: any) => {
        this.snackBar.open('Appointment updated successfuly', '', {
          duration: 2000,
          verticalPosition: 'top',
          panelClass: ['snackbar-success'],
        });
        this.appointmentService.refreshAppointments();
      },
    });
  }
}
