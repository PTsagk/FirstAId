import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AssistantService {
  constructor(private http: HttpClient) {}
  getMessages(doctorId: string | null = null) {
    if (doctorId)
      return this.http.get(
        environment.api_url + `/patient-assistant/messages/` + doctorId,
        {
          withCredentials: true,
        }
      );
    else
      return this.http.get(
        environment.api_url + `/doctor-assistant/messages/`,
        {
          withCredentials: true,
        }
      );
  }

  sendPatientMessage(doctorId: string, message: string) {
    return this.http.post(
      environment.api_url + '/patient-assistant/chat/' + doctorId,
      { question: message },
      { withCredentials: true }
    );
  }

  sendDoctorMessage(params: any) {
    return this.http.post(
      `${environment.api_url + '/doctor-assistant/chat'}`,
      params,
      {
        withCredentials: true,
      }
    );
  }

  deleteThread(doctorId: string | null = null) {
    if (doctorId)
      return this.http.delete(
        environment.api_url + '/patient-assistant/thread/' + doctorId,
        { withCredentials: true }
      );
    else
      return this.http.delete(
        environment.api_url + '/doctor-assistant/thread/',
        {
          withCredentials: true,
        }
      );
  }
}
