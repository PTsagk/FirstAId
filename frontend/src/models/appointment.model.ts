export interface Appointment {
  _id?: string;
  fullname: string;
  email: string;
  severity: 'appointment' | 'emergency' | 'critical';
  date: string;
  time: string;
  description: string;
  gender?: string;
  bloodType?: string;
  allergies?: string;
  diseases?: string;
  height?: string;
  weight?: string;
  lastAppointment?: string;
  doctorNotes?: string;
}
