import { Routes } from '@angular/router';
import { DoctorDashboardComponent } from './pages/doctor-dashboard/doctor-dashboard.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { PatientListsComponent } from './pages/patient-lists/patient-lists.component';
import { ChatBotComponent } from './pages/chat-bot/chat-bot.component';
import { UserDashboardComponent } from './pages/user-dashboard/user-dashboard.component';
import { AppointmentsHistoryComponent } from './pages/appointments-history/appointments-history.component';
import { UserHistoryComponent } from './pages/user-history/user-history.component';
import { DoctorsListComponent } from './components/doctors-list/doctors-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/landing-page/landing-page.component').then(
        (m) => m.LandingPageComponent
      ),
  },
  {
    path: 'doctors',
    component: DoctorDashboardComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'calendar', component: CalendarComponent },
      { path: 'patient-list', component: PatientListsComponent },
      {
        path: 'history',
        component: AppointmentsHistoryComponent,
      },
      { path: 'chat-bot', component: ChatBotComponent },
    ],
  },
  {
    path: 'users',
    component: UserDashboardComponent,
    children: [
      { path: 'dashboard', component: DoctorsListComponent },
      {
        path: 'history',
        component: UserHistoryComponent,
      },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
