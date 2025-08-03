import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AccountService } from './account.service';
import { environment } from '../environment/environment';
import { BehaviorSubject } from 'rxjs';
import { Appointment } from '../models/appointment.model';
@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  appointments: BehaviorSubject<[]> = new BehaviorSubject<[]>([]);
  constructor(private http: HttpClient, private ac: AccountService) {
    this.ac.userInfo.subscribe((userInfo) => {
      if (userInfo) {
        // const cachedAppointments = sessionStorage.getItem('appointments');

        // if (cachedAppointments) {
        //   this.appointments.next(JSON.parse(cachedAppointments));
        // } else {
        //   this.fetchAppointments();
        // }
        this.fetchAppointments();
      }
    });
  }
  updateAppointment(updatedAppointment: Appointment) {
    return this.http.patch(
      environment.api_url + '/appointments/update',
      {
        appointmentInfo: updatedAppointment,
      },
      { withCredentials: true }
    );
  }
  private fetchAppointments() {
    this.http
      .get(environment.api_url + `/appointments`, {
        withCredentials: true,
      })
      .subscribe({
        next: (res: any) => {
          sessionStorage.setItem('appointments', JSON.stringify(res));
          this.appointments.next(res);
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  refreshAppointments() {
    // sessionStorage.removeItem('appointments');
    this.fetchAppointments();
  }
}
