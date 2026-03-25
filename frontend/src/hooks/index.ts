import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  authApi, patientsApi, doctorsApi, departmentsApi,
  appointmentsApi, admissionsApi, clinicalApi, billingApi, inventoryApi,
} from '@/api';
import { toast } from '@/store/toast.store';

const onErr = (err: unknown) => {
  const msg = (err as any)?.response?.data?.message ?? 'Something went wrong.';
  toast.error(msg);
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const useMe = () =>
  useQuery({ queryKey: ['me'], queryFn: () => authApi.me().then(r => r.data.data!) });

// ─── Patients ─────────────────────────────────────────────────────────────────
export const usePatients = (params?: { page?: number; limit?: number; search?: string }) =>
  useQuery({ queryKey: ['patients', params], queryFn: () => patientsApi.list(params).then(r => r.data) });

export const usePatient = (id: number) =>
  useQuery({ queryKey: ['patient', id], queryFn: () => patientsApi.get(id).then(r => r.data.data!), enabled: !!id });

export const usePatientSummary = (id: number) =>
  useQuery({ queryKey: ['patient-summary', id], queryFn: () => patientsApi.summary(id).then(r => r.data.data!), enabled: !!id });

export const useCreatePatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: patientsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['patients'] }); toast.success('Patient registered successfully.'); },
    onError: onErr,
  });
};

export const useUpdatePatient = (id: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof patientsApi.update>[1]) => patientsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['patients'] }); qc.invalidateQueries({ queryKey: ['patient', id] }); toast.success('Patient updated.'); },
    onError: onErr,
  });
};

// ─── Doctors ──────────────────────────────────────────────────────────────────
export const useDoctors = () =>
  useQuery({ queryKey: ['doctors'], queryFn: () => doctorsApi.list().then(r => r.data.data!) });

export const useDoctor = (id: number) =>
  useQuery({ queryKey: ['doctor', id], queryFn: () => doctorsApi.get(id).then(r => r.data.data!), enabled: !!id });

export const useDoctorSchedule = (id: number) =>
  useQuery({ queryKey: ['doctor-schedule', id], queryFn: () => doctorsApi.schedule(id).then(r => r.data.data!), enabled: !!id });

// ─── Departments ──────────────────────────────────────────────────────────────
export const useDepartments = () =>
  useQuery({ queryKey: ['departments'], queryFn: () => departmentsApi.list().then(r => r.data.data!) });

// ─── Appointments ─────────────────────────────────────────────────────────────
export const useTodaysAppointments = () =>
  useQuery({ queryKey: ['appointments', 'today'], queryFn: () => appointmentsApi.today().then(r => r.data.data!) });

export const useUpcomingAppointments = (days = 7) =>
  useQuery({ queryKey: ['appointments', 'upcoming', days], queryFn: () => appointmentsApi.upcoming(days).then(r => r.data.data!) });

export const useAppointmentsByDate = (date: string) =>
  useQuery({ queryKey: ['appointments', 'by-date', date], queryFn: () => appointmentsApi.byDate(date).then(r => r.data.data!), enabled: !!date });

export const useDoctorSlots = (doctor_id: number, date: string) =>
  useQuery({ queryKey: ['doctor-slots', doctor_id, date], queryFn: () => appointmentsApi.slots(doctor_id, date).then(r => r.data.data!), enabled: !!doctor_id && !!date });

export const useBookAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: appointmentsApi.book,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['appointments'] }); toast.success('Appointment booked successfully.'); },
    onError: onErr,
  });
};

export const useUpdateAppointmentStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: number; status: string; notes?: string }) =>
      appointmentsApi.updateStatus(id, status, notes),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['appointments'] }); toast.success('Appointment status updated.'); },
    onError: onErr,
  });
};

// ─── Admissions ───────────────────────────────────────────────────────────────
export const useAdmissions = (params?: { page?: number; limit?: number }) =>
  useQuery({ queryKey: ['admissions', params], queryFn: () => admissionsApi.list(params).then(r => r.data) });

export const useActiveAdmissions = () =>
  useQuery({ queryKey: ['admissions', 'active'], queryFn: () => admissionsApi.active().then(r => r.data.data!) });

export const useBedOccupancy = () =>
  useQuery({ queryKey: ['bed-occupancy'], queryFn: () => admissionsApi.bedOccupancy().then(r => r.data.data!) });

export const useAvailableBeds = () =>
  useQuery({ queryKey: ['available-beds'], queryFn: () => admissionsApi.availableBeds().then(r => r.data.data!) });

export const useWaitingList = () =>
  useQuery({ queryKey: ['waiting-list'], queryFn: () => admissionsApi.waitingList().then(r => r.data.data!) });

export const useAdmitPatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: admissionsApi.admit,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admissions'] });
      qc.invalidateQueries({ queryKey: ['bed-occupancy'] });
      qc.invalidateQueries({ queryKey: ['available-beds'] });
      toast.success('Patient admitted successfully.');
    },
    onError: onErr,
  });
};

export const useDischargePatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, summary, discount_pct }: { id: number; summary?: string; discount_pct?: number }) =>
      admissionsApi.discharge(id, summary, discount_pct),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admissions'] });
      qc.invalidateQueries({ queryKey: ['bed-occupancy'] });
      qc.invalidateQueries({ queryKey: ['billing'] });
      toast.success('Patient discharged and bill generated.');
    },
    onError: onErr,
  });
};

// ─── Clinical ─────────────────────────────────────────────────────────────────
export const useMedicalRecords = (patient_id: number) =>
  useQuery({ queryKey: ['medical-records', patient_id], queryFn: () => clinicalApi.records(patient_id).then(r => r.data.data!), enabled: !!patient_id });

export const usePrescriptions = (patient_id: number) =>
  useQuery({ queryKey: ['prescriptions', patient_id], queryFn: () => clinicalApi.prescriptions(patient_id).then(r => r.data.data!), enabled: !!patient_id });

export const useLabTests = () =>
  useQuery({ queryKey: ['lab-tests'], queryFn: () => clinicalApi.labTests().then(r => r.data.data!) });

export const usePendingLab = () =>
  useQuery({ queryKey: ['lab-pending'], queryFn: () => clinicalApi.pendingLab().then(r => r.data.data!) });

export const useUpdateLabResult = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; status: string; result_value?: string; result_date?: string; remarks?: string }) =>
      clinicalApi.updateLab(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lab-pending'] }); toast.success('Lab result updated.'); },
    onError: onErr,
  });
};

// ─── Billing ──────────────────────────────────────────────────────────────────
export const useBills = (params?: { page?: number; limit?: number }) =>
  useQuery({ queryKey: ['billing', params], queryFn: () => billingApi.bills(params).then(r => r.data) });

export const useBill = (id: number) =>
  useQuery({ queryKey: ['bill', id], queryFn: () => billingApi.bill(id).then(r => r.data.data!), enabled: !!id });

export const useOutstandingBills = () =>
  useQuery({ queryKey: ['billing', 'outstanding'], queryFn: () => billingApi.outstanding().then(r => r.data.data!) });

export const useDoctorRevenue = (year?: number) =>
  useQuery({ queryKey: ['revenue', 'doctor', year], queryFn: () => billingApi.doctorRevenue(year).then(r => r.data.data!) });

export const useMonthlyRevenue = (year?: number) =>
  useQuery({ queryKey: ['revenue', 'monthly', year], queryFn: () => billingApi.monthlyRevenue(year).then(r => r.data.data!) });

export const useCreateBill = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: billingApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['billing'] }); toast.success('Bill generated successfully.'); },
    onError: onErr,
  });
};

export const useMakePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; amount: number; method: string; reference_no?: string }) =>
      billingApi.payment(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['billing'] }); toast.success('Payment recorded successfully.'); },
    onError: onErr,
  });
};

// ─── Inventory ────────────────────────────────────────────────────────────────
export const useMedicines = (params?: { page?: number; limit?: number }) =>
  useQuery({ queryKey: ['medicines', params], queryFn: () => inventoryApi.medicines(params).then(r => r.data) });

export const useLowStock = () =>
  useQuery({ queryKey: ['low-stock'], queryFn: () => inventoryApi.lowStock().then(r => r.data.data!) });

export const useStockReport = () =>
  useQuery({ queryKey: ['stock-report'], queryFn: () => inventoryApi.stockReport().then(r => r.data.data!) });

export const useUpdateStock = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity, expiry_date }: { id: number; quantity: number; expiry_date?: string }) =>
      inventoryApi.updateStock(id, quantity, expiry_date),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medicines'] });
      qc.invalidateQueries({ queryKey: ['low-stock'] });
      toast.success('Stock updated successfully.');
    },
    onError: onErr,
  });
};
