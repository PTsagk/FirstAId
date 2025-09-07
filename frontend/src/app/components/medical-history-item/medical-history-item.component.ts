import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-medical-history-item',
  standalone: true,
  imports: [
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatOption,
    MatSelect,
    MatButtonModule,
  ],
  templateUrl: './medical-history-item.component.html',
  styleUrl: './medical-history-item.component.scss',
})
export class MedicalHistoryItemComponent {
  constructor(private dialogRef: MatDialogRef<MedicalHistoryItemComponent>) {}

  save(historyText: string, historyType: string) {
    this.dialogRef.close({ text: historyText, type: historyType });
  }
}
