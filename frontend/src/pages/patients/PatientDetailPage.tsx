import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, BedDouble, FileText } from 'lucide-react';
import { usePatient, useMedicalRecords, usePrescriptions, usePatients } from '@/hooks';
import { Button, StatusBadge, PageLoader, Table, Tr, Td, ErrorState } from '@/components/shared';
import { formatDate, formatTime, formatCurrency, cn } from '@/lib/utils';

type Tab = 'overview' | 'appointments' | 'admissions' | 'records';

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patientId = parseInt(id!);
  const [tab, setTab] = useState<Tab>('overview');

  const { data: patient, isLoading, isError, refetch } = usePatient(patientId);
  const { data: records } = useMedicalRecords(patientId);
  const { data: prescriptions } = usePrescriptions(patientId);

  if (isLoading) return <PageLoader />;
  if (isError || !patient) return <ErrorState onRetry={refetch} message="Patient not found." />;

  const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'records', label: 'Records', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Back */}
      <button onClick={() => navigate('/patients')} className="flex items-center gap-1.5 text-sm text-[#4A5568] hover:text-[#1A2332] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Patients
      </button>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#006B58]/10 flex items-center justify-center shrink-0">
          <span className="text-lg font-sans font-semibold text-[#006B58]">
            {patient.first_name[0]}{patient.last_name[0]}
          </span>
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-sans font-semibold text-[#1A2332]">{patient.first_name} {patient.last_name}</h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-sm text-[#4A5568]">ID #{patient.patient_id}</span>
            <span className="text-[#4A5568] text-xs">·</span>
            <span className="text-sm text-[#4A5568]">{patient.gender}</span>
            <span className="text-[#4A5568] text-xs">·</span>
            <span className="text-sm text-[#4A5568]">{patient.age ?? '—'} yrs</span>
            {patient.blood_group && (
              <>
                <span className="text-[#4A5568] text-xs">·</span>
                <span className="font-mono text-sm font-semibold text-[#006B58]">{patient.blood_group}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F0F4F8] rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              tab === t.id ? 'bg-white text-[#006B58] shadow-md' : 'text-[#4A5568] hover:text-[#1A2332]'
            )}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="card space-y-3">
            <h2 className="text-sm font-semibold text-[#1A2332]">Contact Information</h2>
            <Field label="Phone" value={patient.phone} />
            <Field label="Email" value={patient.email} />
            <Field label="Date of Birth" value={formatDate(patient.date_of_birth)} />
            <Field label="Address" value={patient.address} />
          </div>
          <div className="card space-y-3">
            <h2 className="text-sm font-semibold text-[#1A2332]">Medical Information</h2>
            <Field label="Blood Group" value={patient.blood_group} />
            <Field label="Allergies" value={patient.allergies} />
            <Field label="Emergency Contact" value={patient.emergency_contact_name} />
            <Field label="Emergency Phone" value={patient.emergency_contact_phone} />
            <Field label="Registered" value={formatDate(patient.created_at)} />
          </div>
        </div>
      )}

      {tab === 'records' && (
        <div className="card">
          <h2 className="text-sm font-semibold text-[#1A2332] mb-4">Medical Records</h2>
          {records?.length === 0 && <p className="text-sm text-[#4A5568] py-6 text-center">No medical records.</p>}
          <Table headers={['Date', 'Doctor', 'Diagnosis', 'Vitals']}>
            {records?.map(r => (
              <Tr key={r.record_id}>
                <Td className="text-[#4A5568]">{formatDate(r.visit_date)}</Td>
                <Td>
                  <p className="font-medium">Dr. {r.doctor_name}</p>
                  <p className="text-xs text-[#4A5568]">{r.specialization}</p>
                </Td>
                <Td>
                  <p>{r.diagnosis ?? '—'}</p>
                  {r.chief_complaint && <p className="text-xs text-[#4A5568]">{r.chief_complaint}</p>}
                </Td>
                <Td>
                  <div className="space-y-0.5 text-xs text-[#4A5568] font-mono">
                    {r.blood_pressure && <p>BP: {r.blood_pressure}</p>}
                    {r.heart_rate && <p>HR: {r.heart_rate} bpm</p>}
                    {r.temperature && <p>Temp: {r.temperature}°C</p>}
                    {r.oxygen_sat && <p>SpO₂: {r.oxygen_sat}%</p>}
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-[#4A5568]">{label}</p>
      <p className="text-sm text-[#1A2332] mt-0.5">{value ?? '—'}</p>
    </div>
  );
}
