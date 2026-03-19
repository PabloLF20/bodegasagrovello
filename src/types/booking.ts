export interface BookingData {
  id: string;
  name: string;
  email: string;
  phone: string;
  guests: number;
  booking_date: string;
  booking_time: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}
