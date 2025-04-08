import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AccountService } from './account.service';
import { environment } from '../environment/environment';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  appointments: BehaviorSubject<[]> = new BehaviorSubject<[]>([]);
  constructor(private http: HttpClient, private ac: AccountService) {
    this.ac.userInfo.subscribe((userInfo) => {
      if (userInfo) {
        this.http
          .get(environment.api_url + `/appointments`, {
            withCredentials: true,
          })
          .subscribe({
            next: (res: any) => {
              this.appointments.next(res);
            },
            error: (err) => {
              console.log(err);
            },
          });
      }
    });
  }
}
