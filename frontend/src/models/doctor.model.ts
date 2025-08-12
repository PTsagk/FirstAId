export interface Doctor {
  _id?: string;
  name: string;
  email?: string;
  specialization?: string;
  telephone?: number;
  city?: string;
  address?: string;
  profession?: string;
  workingDays?: string[];
  workingStartTime?: string;
  workingEndTime?: string;
  specialDates?: string[];
  appointmentDuration?: number;
}
