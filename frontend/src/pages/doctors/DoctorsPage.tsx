import { useState } from 'react';
import { Stethoscope, Calendar } from 'lucide-react';
import { useDoctors, useDoctorSchedule } from '@/hooks';
import {
  SectionHeader, Table, Tr, Td, StatusBadge, PageLoader, EmptyState, Modal, Button
} from '@/components/shared';
import { formatDate, formatTime, formatCurrency, cn } from '@/lib/utils';

export default function DoctorsPage() {
  const { data: doctors, isLoading } = useDoctors();
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);

  const selectedDoctor = doctors?.find(d => d.doctor_id === selectedDoctorId);
  const { data: schedule, isLoading: loadSchedule } = useDoctorSchedule(selectedDoctorId ?? 0);

  const byDept = doctors?.reduce<Record<string, typeof doctors>>((acc, d) => {
    const dept = d.department_name ?? 'General';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(d);
    return acc;
  }, {}) ?? {};

  return (
    <div>
      <SectionHeader
        title="Doctors"
        description="Active medical staff and their schedules"
      />

      {isLoading ? <PageLoader /> : (
        <div className="space-y-8">
          {Object.entries(byDept).map(([dept, depts]) => (
            <div key={dept}>
              <h2 className="text-xs font-semibold text-[#4A5568] uppercase tracking-wider mb-3">{dept}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {depts.map(d => (
                  <div
                    key={d.doctor_id}
                    className="card-hover"
                    onClick={() => setSelectedDoctorId(d.doctor_id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#006B58]/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-sans font-semibold text-[#006B58]">
                          {d.first_name[0]}{d.last_name[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[#1A2332]">
                          Dr. {d.first_name} {d.last_name}
                        </p>
                        <p className="text-xs text-[#4A5568] mt-0.5">{d.specialization ?? 'General Physician'}</p>
                        <p className="text-xs text-[#4A5568]">{d.department_name}</p>
                      </div>
                      <StatusBadge status={d.is_active ? 'Active' : 'Cancelled'} />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-[#4A5568]">Consultation Fee</p>
                        <p className="font-medium text-[#1A2332] mt-0.5">{formatCurrency(d.consultation_fee)}</p>
                      </div>
                      <div>
                        <p className="text-[#4A5568]">Available</p>
                        <p className="font-medium text-[#1A2332] mt-0.5">{d.available_days}</p>
                      </div>
                      <div>
                        <p className="text-[#4A5568]">Hours</p>
                        <p className="font-mono font-medium text-[#1A2332] mt-0.5">
                          {formatTime(d.available_from)} – {formatTime(d.available_to)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#4A5568]">License</p>
                        <p className="font-mono text-[#1A2332] mt-0.5 truncate">{d.license_number}</p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedDoctorId(d.doctor_id); }}
                      className="mt-4 flex items-center gap-1.5 text-xs text-[#006B58] hover:underline"
                    >
                      <Calendar className="w-3 h-3" />
                      View Schedule
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {!doctors?.length && (
            <EmptyState icon={<Stethoscope className="w-8 h-8" />} title="No active doctors" />
          )}
        </div>
      )}

      {/* Schedule modal */}
      <Modal
        open={!!selectedDoctorId}
        onClose={() => setSelectedDoctorId(null)}
        title={selectedDoctor ? `Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name} — Schedule` : 'Schedule'}
        size="lg"
      >
        {loadSchedule ? <PageLoader /> : (
          <>
            {selectedDoctor && (
              <div className="flex items-center gap-4 pb-4 mb-4 border-b border-[#C0C8BB]/20">
                <div className="w-10 h-10 rounded-xl bg-[#006B58]/10 flex items-center justify-center">
                  <span className="text-sm font-sans font-semibold text-[#006B58]">
                    {selectedDoctor.first_name[0]}{selectedDoctor.last_name[0]}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-sm">{selectedDoctor.specialization ?? 'General'}</p>
                  <p className="text-xs text-[#4A5568]">
                    Available: {selectedDoctor.available_days} · {formatTime(selectedDoctor.available_from)} – {formatTime(selectedDoctor.available_to)}
                  </p>
                </div>
              </div>
            )}
            <Table headers={['Date', 'Time', 'Patient', 'Reason', 'Status']}>
              {schedule?.schedule.map((s, i) => (
                <Tr key={i}>
                  <Td className="text-[#4A5568] whitespace-nowrap">{formatDate(String(s.appointment_date))}</Td>
                  <Td><span className="font-mono text-xs text-[#006B58]">{formatTime(s.appointment_time)}</span></Td>
                  <Td><p className="font-medium text-sm">{s.patient_name}</p></Td>
                  <Td className="text-xs text-[#4A5568]">{s.reason ?? '—'}</Td>
                  <Td><StatusBadge status={s.status} /></Td>
                </Tr>
              ))}
            </Table>
            {!schedule?.schedule.length && (
              <EmptyState
                icon={<Calendar className="w-8 h-8" />}
                title="No upcoming appointments"
                description="This doctor has no scheduled appointments."
              />
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
