import { Component, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AppointmentService } from '../../../services/appointment.service';
import moment from 'moment';
@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FullCalendarModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {
  constructor(private appointmentService: AppointmentService) {}
  calendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    editable: true,
    selectable: true,
    select: this.handleDateSelect.bind(this),
    events: [],
    // add custom height
    height: '100%',
    eventContent: this.renderEventContent,
    headerToolbar: {
      left: '',
      center: 'title',
      right: 'prev,next',
    },
  };

  ngOnInit(): void {
    this.appointmentService.appointments.subscribe((appointments: any) => {
      this.calendarOptions.events = appointments.map((appointment: any) => {
        let color = '#00c450';
        if (appointment.severity === 'high') color = '#ff0000';
        else if (appointment.severity === 'critical') color = 'orange';
        return {
          title: appointment.fullname,
          date: moment(appointment.appointmentDate).format('YYYY-MM-DD'),
          backgroundColor: color,
          borderColor: color,
          extendedProps: {
            severity: appointment.severity,
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
  handleDateSelect(selectInfo: any) {
    const title = prompt('Enter event title:');
    const calendarApi = selectInfo.view.calendar;

    calendarApi.unselect();

    if (title) {
      calendarApi.addEvent({
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
      });
    }
  }
}
