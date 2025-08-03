import { Component, ViewChild } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DoctorCardComponent } from '../doctor-card/doctor-card.component';
import {
  MatDrawer,
  MatDrawerContainer,
  MatDrawerContent,
} from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { marked } from 'marked';

@Component({
  selector: 'app-doctors-list',
  standalone: true,
  imports: [
    MatExpansionModule,
    MatFormField,
    MatInputModule,
    MatSelectModule,
    DoctorCardComponent,
    MatDrawer,
    MatDrawerContainer,
    MatDrawerContent,
    MatButtonModule,
    MatInputModule,
    MatFormField,
    ReactiveFormsModule,
    MatFormFieldModule,
    RouterOutlet,
    RouterLink,
  ],
  templateUrl: './doctors-list.component.html',
  styleUrl: './doctors-list.component.scss',
})
export class DoctorsListComponent {
  @ViewChild('sidebar', { static: true }) sidebar!: MatDrawer;
  specialties: string[] = [
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'Neurology',
    'Oncology',
    'Pediatrics',
    'Psychiatry',
    'Radiology',
    'Urology',
    'General Medicine',
    'Orthopedics',
    'Ophthalmology',
    'Gynecology',
  ];
  allDoctors: any[] = [];
  doctors: any[] = [];
  availabilities: string[] = ['All', 'Open Now'];
  messages: { text: string; role: string }[] = [];
  selectedDoctor: any = {};
  pending: boolean = false;
  messageForm!: FormGroup;
  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.getDoctors();
    this.messageForm = this.fb.group({
      message: ['', Validators.required],
    });
  }

  getDoctors() {
    this.http
      .get(environment.api_url + `/users/doctors`, {
        withCredentials: true,
      })
      .subscribe({
        next: (res: any) => {
          // this.doctors = res.map((doctor: any) => ({
          //   ...doctor,
          //   available:
          //     doctor.workingStartTime !== 'None' &&
          //     doctor.workingEndTime !== 'None',
          // }));
          this.allDoctors = res;
          this.doctors = res;
        },
        error: (err) => {
          console.error('Error fetching doctors:', err);
        },
      });
  }

  getMessages(doctorId?: string) {
    this.messages = [];
    this.pending = true;
    this.http
      .get(environment.api_url + `/patient-assistant/messages/` + doctorId, {
        withCredentials: true,
      })
      .subscribe({
        next: (res: any) => {
          this.messages = res
            .map((msg: any) => ({
              text: marked(
                msg.role == 'assistant'
                  ? msg.content?.message_text
                  : msg.content
              ) as string,
              role: msg.role,
            }))
            .reverse();
          this.scrollToBottom();
          this.pending = false;
        },
        error: (err) => {
          console.error('Error fetching messages:', err);
          this.pending = false;
        },
      });
  }

  searchDoctors(input: string) {
    this.doctors = this.allDoctors
      .filter((doctor: any) => {
        return (
          doctor.name.toLowerCase().includes(input.toLowerCase()) ||
          doctor.profession.toLowerCase().includes(input.toLowerCase())
        );
      })
      .sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
  }

  sendMessage(message: string) {
    this.messages.push({
      text: message,
      role: 'user',
    });

    this.messages.push({
      text: 'loading',
      role: 'assistant',
    });
    this.http
      .post(
        environment.api_url +
          '/patient-assistant/chat/' +
          this.selectedDoctor._id,
        { question: message },
        { withCredentials: true }
      )
      .subscribe({
        next: (res: any) => {
          this.messages.pop(); // Remove the loading message
          this.messages.push({
            text: marked(
              res.role == 'assistant' ? res.content?.message_text : res.content
            ) as string,
            role: 'assistant',
          });
        },
        error: (err) => {
          this.messages.pop(); // Remove the loading message
          this.messages.push({
            text: 'Error: Unable to get response from the server.',
            role: 'assistant',
          });
        },
      });
    this.scrollToBottom();
  }

  openChat(doctor: any) {
    if (this.selectedDoctor._id === doctor._id) {
      this.sidebar.toggle();
      return;
    }
    this.messages = [];
    this.sidebar.open();
    this.getMessages(doctor._id);
    this.selectedDoctor = { ...doctor };
  }

  deleteThread() {
    this.http
      .delete(
        environment.api_url +
          '/patient-assistant/thread/' +
          this.selectedDoctor._id,
        { withCredentials: true }
      )
      .subscribe({
        next: () => {
          this.messages = [];
          this.selectedDoctor = {};
          this.sidebar.close();
        },
        error: (err) => {
          console.error('Error deleting thread:', err);
        },
      });
  }

  scrollToBottom() {
    setTimeout(() => {
      const chatContainer = document.querySelector('.messages-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 1000);
  }
}
