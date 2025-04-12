export interface Appointment {
  fullname: string;
  email: string;
  severity: 'low' | 'high' | 'critical';
  appointmentDate: string;
  appointmentTime: string;
}
