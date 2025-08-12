export interface Patient {
  _id?: string;
  name?: string;
  email?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  telephone?: number;
  city?: string;
  address?: string;
  bloodType?: string;
  weight?: number;
  height?: number;
  allergies?: string;
  chronicConditions?: string;
  prescriptions?: string;
  mentalHealthHistory?: string;
  pastSurgeries?: string;
  dietPreferences?: string;
}
