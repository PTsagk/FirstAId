import { Routes } from '@angular/router';
import { DoctorDashboardComponent } from './pages/doctor-dashboard/doctor-dashboard.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { PatientHistoryComponent } from './pages/patient-history/patient-history.component';
import { ChatBotComponent } from './pages/chat-bot/chat-bot.component';

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
      { path: 'patient-history', component: PatientHistoryComponent },
      { path: 'chat-bot', component: ChatBotComponent },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
