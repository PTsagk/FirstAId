import { Component, ViewEncapsulation } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DoctorCardComponent } from '../../components/doctor-card/doctor-card.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { NgClass } from '@angular/common';
import {
  MatDrawer,
  MatDrawerContainer,
  MatDrawerContent,
} from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
@Component({
  selector: 'app-user-dashboard',
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
    MatFormFieldModule,
    ReactiveFormsModule,
    MatFormFieldModule,
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class UserDashboardComponent {
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
  messages = [
    {
      text: 'Search for doctors by name or specialty',
      type: 'info',
      role: 'user',
    },
    {
      text: 'Select a doctor to view more details and book an appointment',
      type: 'info',
      role: 'bot',
    },
    {
      text: 'Use the filters to narrow down your search results',
      type: 'info',
      role: 'user',
    },
    {
      text: 'Search for doctors by name or specialty',
      type: 'info',
      role: 'user',
    },
    {
      text: 'Select a doctor to view more details and book an appointment',
      type: 'info',
      role: 'bot',
    },
    {
      text: 'Use the filters to narrow down your search results',
      type: 'info',
      role: 'user',
    },
    {
      text: 'Search for doctors by name or specialty',
      type: 'info',
      role: 'user',
    },
    {
      text: 'Select a doctor to view more details and book an appointment',
      type: 'info',
      role: 'bot',
    },
    {
      text: 'Use the filters to narrow down your search results',
      type: 'info',
      role: 'user',
    },
    {
      text: 'Search for doctors by name or specialty',
      type: 'info',
      role: 'user',
    },
    {
      text: 'Select a doctor to view more details and book an appointment',
      type: 'info',
      role: 'bot',
    },
    {
      text: 'Use the filters to narrow down your search results',
      type: 'info',
      role: 'user',
    },
    {
      text: 'Search for doctors by name or specialty',
      type: 'info',
      role: 'user',
    },
    {
      text: 'Select a doctor to view more details and book an appointment',
      type: 'info',
      role: 'bot',
    },
    {
      text: 'Use the filters to narrow down your search results',
      type: 'info',
      role: 'user',
    },
  ];

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
      type: 'user',
      role: 'user',
    });
    this.messages.push({
      text: 'Searching for doctors...',
      type: 'info',
      role: 'bot',
    });
    this.scrollToBottom();
  }

  scrollToBottom() {
    setTimeout(() => {
      const chatContainer = document.querySelector('.messages-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }
}
