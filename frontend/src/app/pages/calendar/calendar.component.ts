import { Component } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular'; // Import FullCalendar module
import dayGridPlugin from '@fullcalendar/daygrid'; // Month view plugin
import interactionPlugin from '@fullcalendar/interaction'; // Interaction plugin for adding events

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FullCalendarModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent {
  calendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    editable: true,
    selectable: true,
    select: this.handleDateSelect.bind(this),
    events: [{ title: 'Existing Event', date: '2025-06-10' }],
    headerToolbar: {
      left: '',
      center: 'title',
      right: 'prev,next',
    },
  };

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
