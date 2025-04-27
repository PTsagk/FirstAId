export interface Appointment {
  fullname: string;
  email: string;
  severity: 'low' | 'medium' | 'high';
  appointmentDate: string;
  appointmentTime: string;
}
