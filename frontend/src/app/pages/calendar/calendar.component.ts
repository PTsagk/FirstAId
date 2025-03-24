import { Component } from '@angular/core';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCalendar } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatCalendar,
    DatePipe,
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent {
  selectedDate: Date | null = null;
}
