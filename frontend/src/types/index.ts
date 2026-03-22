// ─── Auth ────────────────────────────────────────────────────────────────────

export interface JwtPayload {
  user_id: number;
  email: string;
  role_id: number;
  role_name: string;
}

export interface AuthUser {
  user_id: number;
  email: string;
  role: string;
  is_active: boolean;
  last_login: string | null;
  profile: {
    profile_type: 'doctor' | 'staff';
    first_name: string;
    last_name: string;
    phone: string | null;
    specialization: string | null;
    department: string | null;
  } | null;
}

export interface LoginResponse {
  token: string;
  user: { user_id: number; email: string; role: string };
}

// ─── API ─────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: { total: number; page: number; limit: number; pages: number };
}

// ─── Patients ─────────────────────────────────────────────────────────────────

export interface Patient {
  patient_id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  blood_group: string | null;
  email: string | null;
  phone: string;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  allergies: string | null;
  created_at: string;
  updated_at: string;
  age?: number;
  total_visits?: number;
}

export interface PatientSummary {
  patient: Patient & { age: number };
  appointments: Appointment[];
  admissions: Admission[];
  medical_records: MedicalRecord[];
}

export interface CreatePatientInput {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  blood_group?: string;
  email?: string;
  phone: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  allergies?: string;
}

// ─── Doctors ──────────────────────────────────────────────────────────────────

export interface Doctor {
  doctor_id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  phone: string | null;
  specialization: string | null;
  department_id: number | null;
  department_name: string | null;
  license_number: string;
  consultation_fee: number;
  available_days: string;
  available_from: string;
  available_to: string;
  is_active: boolean;
  joined_date: string | null;
}

// ─── Departments ──────────────────────────────────────────────────────────────

export interface Department {
  department_id: number;
  name: string;
  description: string | null;
  location: string | null;
  head_doctor_id: number | null;
  head_doctor_name: string | null;
  doctor_count: number;
  created_at: string;
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export type AppointmentStatus = 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled' | 'No-Show';

export interface Appointment {
  appointment_id: number;
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
  reason: string | null;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  patient_name?: string;
  patient_phone?: string;
  patient_allergies?: string | null;
  doctor_name?: string;
  specialization?: string | null;
  department?: string | null;
}

export interface TodaysAppointment {
  appointment_id: number;
  appointment_time: string;
  patient_name: string;
  patient_phone: string;
  doctor_name: string;
  specialization: string | null;
  department: string | null;
  reason: string | null;
  status: AppointmentStatus;
}

export interface DoctorSlots {
  doctor: string;
  specialization: string | null;
  available_days: string;
  available_from: string;
  available_to: string;
  is_active: boolean;
  booked_slots: string[];
}

export interface BookAppointmentInput {
  patient_id: number;
  doctor_id: number;
  date: string;
  time: string;
  reason?: string;
}

// ─── Admissions ───────────────────────────────────────────────────────────────

export type VisitType = 'Emergency' | 'Planned' | 'Transfer';
export type AdmissionStatus = 'Active' | 'Discharged' | 'Transferred';

export interface Admission {
  admission_id: number;
  patient_id: number;
  bed_id: number;
  admitting_doctor_id: number;
  admitted_by: string | null;
  admission_date: string;
  expected_discharge: string | null;
  actual_discharge: string | null;
  visit_type: VisitType;
  status: AdmissionStatus;
  reason: string | null;
  discharge_summary: string | null;
  patient_name?: string;
  doctor_name?: string;
  room_number?: string;
  bed_number?: string;
  room_type?: string;
  patient_phone?: string;
  blood_group?: string | null;
  allergies?: string | null;
  admitting_doctor?: string;
  days_admitted?: number;
}

export interface BedOccupancy {
  bed_id: number;
  bed_number: string;
  room_number: string;
  room_type: string;
  floor: number | null;
  status: 'Available' | 'Occupied' | 'Under Maintenance';
  patient_name?: string | null;
}

export interface OccupancySummary {
  room_type: string;
  total_beds: number;
  occupied: number;
  available: number;
}

export interface WaitingListEntry {
  waiting_id: number;
  patient_id: number;
  patient_name: string;
  doctor_id: number;
  room_type_id: number;
  visit_type: VisitType;
  reason: string | null;
  added_at: string;
}

export interface AdmitPatientInput {
  patient_id: number;
  bed_id?: number;
  doctor_id: number;
  reason?: string;
  visit_type: VisitType;
  exp_discharge?: string;
}

// ─── Clinical ─────────────────────────────────────────────────────────────────

export interface MedicalRecord {
  record_id: number;
  patient_id: number;
  doctor_id: number;
  appointment_id: number | null;
  admission_id: number | null;
  visit_date: string;
  chief_complaint: string | null;
  diagnosis: string | null;
  treatment_plan: string | null;
  blood_pressure: string | null;
  heart_rate: number | null;
  temperature: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  oxygen_sat: number | null;
  notes: string | null;
  created_at: string;
  doctor_name?: string;
  specialization?: string | null;
  patient_name?: string;
}

export interface Prescription {
  prescription_id: number;
  record_id: number;
  patient_id: number;
  prescribed_date: string;
  valid_till: string | null;
  notes: string | null;
  doctor_name?: string;
  is_valid?: boolean;
  items?: PrescriptionItem[];
}

export interface PrescriptionItem {
  prescription_item_id: number;
  prescription_id: number;
  medicine_id: number;
  dosage: string | null;
  frequency: string | null;
  duration_days: number | null;
  quantity: number;
  instructions: string | null;
}

export type LabResultStatus = 'Ordered' | 'In Progress' | 'Completed' | 'Cancelled';

export interface LabResult {
  result_id: number;
  patient_id: number;
  record_id: number | null;
  test_id: number;
  ordered_date: string;
  result_value: string | null;
  result_date: string | null;
  status: LabResultStatus;
  remarks: string | null;
}

export interface LabTest {
  test_id: number;
  test_name: string;
  description: string | null;
  normal_range: string | null;
  unit: string | null;
  price: number;
}

// ─── Billing ──────────────────────────────────────────────────────────────────

export type BillStatus = 'Draft' | 'Pending' | 'Paid' | 'Partially Paid' | 'Cancelled';
export type PaymentMethod = 'Cash' | 'Card' | 'Bank Transfer' | 'Mobile Payment' | 'Insurance';

export interface Bill {
  bill_id: number;
  patient_id: number;
  appointment_id: number | null;
  admission_id: number | null;
  bill_date: string;
  due_date: string | null;
  total_amount: number;
  discount_pct: number;
  amount_paid: number;
  status: BillStatus;
  patient_name?: string;
  patient_phone?: string;
  items?: BillItem[];
  payments?: Payment[];
}

export interface BillItem {
  bill_item_id: number;
  bill_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface Payment {
  payment_id: number;
  bill_id: number;
  amount: number;
  method: PaymentMethod;
  reference_no: string | null;
  payment_date: string;
  received_by: number | null;
  received_by_name: string | null;
}

export interface OutstandingBill {
  bill_id: number;
  patient_name: string;
  phone: string;
  bill_date: string;
  due_date: string | null;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  status: BillStatus;
  days_overdue: number;
}

export interface DoctorRevenue {
  doctor_name: string;
  specialization: string | null;
  total_consultations: number;
  total_revenue: number;
}

export interface MonthlyRevenue {
  month: number;
  year: number;
  total_bills: number;
  total_revenue: number;
  total_collected: number;
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export type StockStatus = 'OK' | 'LOW STOCK' | 'OUT OF STOCK' | 'EXPIRING SOON';

export interface Medicine {
  medicine_id: number;
  name: string;
  generic_name: string | null;
  category: string | null;
  manufacturer: string | null;
  unit: string | null;
  unit_price: number;
  is_active: boolean;
  quantity: number;
  reorder_level?: number;
  expiry_date?: string | null;
  stock_status: StockStatus;
  last_updated?: string;
}

export interface StockReport {
  category: string | null;
  medicine_count: number;
  total_units: number;
  stock_value_npr: number;
}
