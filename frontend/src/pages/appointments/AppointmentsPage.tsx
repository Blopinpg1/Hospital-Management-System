import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, PlusCircle, Clock } from 'lucide-react';
import {
  useTodaysAppointments, useAppointmentsByDate, useDoctors, usePatients,
  useBookAppointment, useUpdateAppointmentStatus,
} from '@/hooks';
import {
  SectionHeader, Button, Modal, Input, Select, Textarea,
  Table, Tr, Td, StatusBadge, PageLoader, EmptyState
} from '@/components/shared';
import { formatDate, formatTime } from '@/lib/utils';
import type { AppointmentStatus } from '@/types';

const STATUS_OPTIONS = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No-Show'].map(s => ({ value: s, label: s }));

export default function AppointmentsPage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);
  const [showBook, setShowBook] = useState(false);
  const [showStatus, setShowStatus] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<AppointmentStatus>('Confirmed');
  const [statusNotes, setStatusNotes] = useState('');
  const [formError, setFormError] = useState('');

  const isToday = selectedDate === today;
  const { data: todayAppts, isLoading: loadToday } = useTodaysAppointments();
  const { data: dateAppts, isLoading: loadDate } = useAppointmentsByDate(isToday ? '' : selectedDate);
  const { data: doctors } = useDoctors();
  const { data: patients } = usePatients({ limit: 100 });
  const bookMutation = useBookAppointment();
  const statusMutation = useUpdateAppointmentStatus();

  const appointments = isToday ? todayAppts : dateAppts;
  const isLoading = isToday ? loadToday : loadDate;

  const [form, setForm] = useState({
    patient_id: '', doctor_id: '', date: today, time: '09:00', reason: '',
  });

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    try {
      await bookMutation.mutateAsync({
        patient_id: parseInt(form.patient_id),
        doctor_id: parseInt(form.doctor_id),
        date: form.date,
        time: form.time,
        reason: form.reason || undefined,
      });
      setShowBook(false);
      setForm({ patient_id: '', doctor_id: '', date: today, time: '09:00', reason: '' });
    } catch (err: any) {
      setFormError(err?.response?.data?.message ?? 'Failed to book appointment.');
    }
  }

  async function handleStatusUpdate() {
    if (!showStatus) return;
    await statusMutation.mutateAsync({ id: showStatus, status: newStatus, notes: statusNotes || undefined });
    setShowStatus(null);
    setStatusNotes('');
  }

  const patientOptions = [
    { value: '', label: 'Select patient' },
    ...(patients?.data.map(p => ({ value: String(p.patient_id), label: `${p.first_name} ${p.last_name} — ${p.phone}` })) ?? []),
  ];

  const doctorOptions = [
    { value: '', label: 'Select doctor' },
    ...(doctors?.map(d => ({ value: String(d.doctor_id), label: `Dr. ${d.first_name} ${d.last_name} · ${d.specialization ?? 'General'}` })) ?? []),
  ];

  return (
    <div>
      <SectionHeader
        title="Appointments"
        description="View and manage patient appointments"
        action={<Button icon={<PlusCircle className="w-4 h-4" />} onClick={() => setShowBook(true)}>Book Appointment</Button>}
      />

      {/* Date picker */}
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-4 h-4 text-[#4A5568]" />
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="input w-auto text-sm"
        />
        {selectedDate !== today && (
          <Button variant="ghost" size="sm" onClick={() => setSelectedDate(today)}>Today</Button>
        )}
        <span className="text-sm text-[#4A5568]">
          {isToday ? "Today's Appointments" : formatDate(selectedDate)}
        </span>
      </div>

      {/* List */}
      <div className="card">
        {isLoading ? <PageLoader /> : (
          <>
            <Table headers={['Time', 'Patient', 'Doctor', 'Reason', 'Status', '']}>
              {(appointments as any[])?.map((appt: any) => (
                <Tr key={appt.appointment_id}>
                  <Td>
                    <span className="font-mono text-xs font-medium text-[#006B58]">
                      {formatTime(appt.appointment_time)}
                    </span>
                  </Td>
                  <Td>
                    <p className="font-medium">{appt.patient_name}</p>
                    <p className="text-xs text-[#4A5568]">{appt.patient_phone}</p>
                  </Td>
                  <Td>
                    <p>Dr. {appt.doctor_name}</p>
                    <p className="text-xs text-[#4A5568]">{appt.specialization ?? appt.department}</p>
                  </Td>
                  <Td className="text-[#4A5568] text-xs max-w-[160px] truncate">{appt.reason ?? '—'}</Td>
                  <Td><StatusBadge status={appt.status} /></Td>
                  <Td>
                    <button
                      onClick={() => { setShowStatus(appt.appointment_id); setNewStatus(appt.status); }}
                      className="text-xs text-[#006B58] hover:underline"
                    >
                      Update
                    </button>
                  </Td>
                </Tr>
              ))}
            </Table>
            {(!appointments || (appointments as any[]).length === 0) && (
              <EmptyState icon={<Clock className="w-8 h-8" />} title="No appointments" description={`No appointments scheduled for ${isToday ? 'today' : formatDate(selectedDate)}.`} />
            )}
          </>
        )}
      </div>

      {/* Book modal */}
      <Modal open={showBook} onClose={() => setShowBook(false)} title="Book Appointment">
        <form onSubmit={handleBook} className="space-y-4">
          <Select label="Patient *" value={form.patient_id} onChange={e => setForm(p => ({ ...p, patient_id: e.target.value }))} options={patientOptions} required />
          <Select label="Doctor *" value={form.doctor_id} onChange={e => setForm(p => ({ ...p, doctor_id: e.target.value }))} options={doctorOptions} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date *" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
            <Input label="Time *" type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} required />
          </div>
          <Input label="Reason" value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Chief complaint or reason for visit" />
          {formError && <p className="text-xs text-[#BA1A1A]">{formError}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" type="button" onClick={() => setShowBook(false)}>Cancel</Button>
            <Button type="submit" loading={bookMutation.isPending}>Book Appointment</Button>
          </div>
        </form>
      </Modal>

      {/* Status update modal */}
      <Modal open={!!showStatus} onClose={() => setShowStatus(null)} title="Update Appointment Status" size="sm">
        <div className="space-y-4">
          <Select label="Status" value={newStatus} onChange={e => setNewStatus(e.target.value as AppointmentStatus)} options={STATUS_OPTIONS} />
          <Textarea label="Notes (optional)" value={statusNotes} onChange={e => setStatusNotes(e.target.value)} rows={2} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setShowStatus(null)}>Cancel</Button>
            <Button loading={statusMutation.isPending} onClick={handleStatusUpdate}>Update</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
