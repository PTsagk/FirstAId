export interface DoctorMessage {
  date: string;
  time: string;
  messageReason: string;
  to: string;
  from: string;
  doctorNotes: string;
  patientNotes: string;
  fullname: string;
  appointmentId: string;
  patientId: string;
  doctorName: string;
}

export interface PatientMessage {
  to: string;
  from: string;
  fullname: string;
  date: string;
  time: string;
  appointmentId: string;
  doctorId: string;
  message: string;
}
