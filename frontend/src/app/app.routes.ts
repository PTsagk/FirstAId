import { Routes } from '@angular/router';
import { DoctorDashboardComponent } from './pages/doctor-dashboard/doctor-dashboard.component';
import { UserDashboardComponent } from './pages/user-dashboard/user-dashboard.component';

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
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('./pages/calendar/calendar.component').then(
            (m) => m.CalendarComponent
          ),
      },
      {
        path: 'appointment-list',
        loadComponent: () =>
          import(
            './components/appointment-list/appointment-list.component'
          ).then((m) => m.AppointmentListComponent),
      },
      {
        path: 'history',
        loadComponent: () =>
          import(
            './pages/appointments-history/appointments-history.component'
          ).then((m) => m.AppointmentsHistoryComponent),
      },
      {
        path: 'chat-bot',
        loadComponent: () =>
          import('./pages/chat-bot/chat-bot.component').then(
            (m) => m.ChatBotComponent
          ),
      },
    ],
  },
  {
    path: 'users',
    component: UserDashboardComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/doctors-list/doctors-list.component').then(
            (m) => m.DoctorsListComponent
          ),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./pages/user-history/user-history.component').then(
            (m) => m.UserHistoryComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
