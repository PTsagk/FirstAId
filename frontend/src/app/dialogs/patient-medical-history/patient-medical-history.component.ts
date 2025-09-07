import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-patient-medical-history',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './patient-medical-history.component.html',
  styleUrl: './patient-medical-history.component.scss',
})
export class PatientMedicalHistoryComponent {
  medicalHistory: any[] = [];

  downloadJson() {
    const jsonStr = JSON.stringify(this.medicalHistory, null, 2); // pretty print
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json'; // filename
    a.click();

    window.URL.revokeObjectURL(url); // clean up
  }
}
