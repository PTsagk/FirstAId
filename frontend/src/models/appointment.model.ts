export interface Appointment {
  _id?: string;
  fullname: string;
  email: string;
  severity: 'appointment' | 'emergency' | 'critical';
  date: string;
  time: string;
  appointmentDuration?: number;
  description: string;
  lastAppointment?: string;
  doctorNotes?: string;
  status?: 'pending' | 'completed' | 'canceled' | 'past';
  gender?: string;
  bloodType?: string;
  weight?: string;
  height?: string;
  allergies?: string;
  chronicConditions?: string;
  prescriptions?: string;
  mentalHealthHistory?: string;
  pastSurgeries?: string;
  dietPreferences?: string;
  patientId?: string;
  doctorId?: string;
}
