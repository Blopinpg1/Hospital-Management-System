import { useState } from 'react';
import { FlaskConical, Search } from 'lucide-react';
import { usePatients, useMedicalRecords, usePrescriptions, usePendingLab, useUpdateLabResult } from '@/hooks';
import {
  SectionHeader, Select, Table, Tr, Td, StatusBadge, PageLoader, EmptyState, Modal, Button, Input, Textarea
} from '@/components/shared';
import { formatDate, cn } from '@/lib/utils';
import type { LabResultStatus } from '@/types';

type TabId = 'records' | 'prescriptions' | 'lab';

const LAB_STATUS_OPTIONS: { value: LabResultStatus; label: string }[] = [
  { value: 'Ordered', label: 'Ordered' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
];

export default function ClinicalPage() {
  const [tab, setTab] = useState<TabId>('records');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [showLabUpdate, setShowLabUpdate] = useState<number | null>(null);
  const [labForm, setLabForm] = useState({ result_value: '', result_date: '', status: 'Completed' as LabResultStatus, remarks: '' });

  const { data: patients } = usePatients({ limit: 200 });
  const { data: records, isLoading: loadRecords } = useMedicalRecords(selectedPatientId ?? 0);
  const { data: prescriptions, isLoading: loadRx } = usePrescriptions(selectedPatientId ?? 0);
  const { data: pendingLab, isLoading: loadLab } = usePendingLab();
  const updateLab = useUpdateLabResult();

  const patientOptions = [
    { value: '', label: 'Select a patient…' },
    ...(patients?.data.map(p => ({ value: String(p.patient_id), label: `${p.first_name} ${p.last_name} — #${p.patient_id}` })) ?? []),
  ];

  async function handleLabUpdate() {
    if (!showLabUpdate) return;
    await updateLab.mutateAsync({ id: showLabUpdate, ...labForm });
    setShowLabUpdate(null);
    setLabForm({ result_value: '', result_date: '', status: 'Completed', remarks: '' });
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'records', label: 'Medical Records' },
    { id: 'prescriptions', label: 'Prescriptions' },
    { id: 'lab', label: `Pending Lab (${pendingLab?.length ?? '…'})` },
  ];

  return (
    <div>
      <SectionHeader title="Clinical" description="Medical records, prescriptions and lab results" />

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F0F4F8] rounded-xl p-1 w-fit mb-6">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn(
            'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all',
            tab === t.id ? 'bg-white text-[#006B58] shadow-md' : 'text-[#4A5568] hover:text-[#1A2332]'
          )}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Patient selector for records + prescriptions */}
      {(tab === 'records' || tab === 'prescriptions') && (
        <div className="mb-5 max-w-sm">
          <Select
            label="Patient"
            value={String(selectedPatientId ?? '')}
            onChange={e => setSelectedPatientId(e.target.value ? parseInt(e.target.value) : null)}
            options={patientOptions}
          />
        </div>
      )}

      {/* Medical Records */}
      {tab === 'records' && (
        <div className="card">
          {!selectedPatientId ? (
            <EmptyState icon={<Search className="w-8 h-8" />} title="Select a patient" description="Choose a patient above to view their medical records." />
          ) : loadRecords ? <PageLoader /> : (
            <>
              <Table headers={['Date', 'Doctor', 'Chief Complaint', 'Diagnosis', 'Treatment', 'Vitals']}>
                {records?.map(r => (
                  <Tr key={r.record_id}>
                    <Td className="text-[#4A5568] whitespace-nowrap">{formatDate(r.visit_date)}</Td>
                    <Td>
                      <p className="font-medium text-xs">Dr. {r.doctor_name}</p>
                      <p className="text-xs text-[#4A5568]">{r.specialization}</p>
                    </Td>
                    <Td className="text-xs text-[#4A5568] max-w-[140px]">{r.chief_complaint ?? '—'}</Td>
                    <Td className="text-xs max-w-[160px]">{r.diagnosis ?? '—'}</Td>
                    <Td className="text-xs text-[#4A5568] max-w-[160px]">{r.treatment_plan ?? '—'}</Td>
                    <Td>
                      <div className="text-xs font-mono space-y-0.5 text-[#4A5568]">
                        {r.blood_pressure && <p>BP {r.blood_pressure}</p>}
                        {r.heart_rate && <p>HR {r.heart_rate}</p>}
                        {r.temperature && <p>{r.temperature}°C</p>}
                        {r.oxygen_sat && <p>SpO₂ {r.oxygen_sat}%</p>}
                        {r.weight_kg && <p>{r.weight_kg}kg</p>}
                      </div>
                    </Td>
                  </Tr>
                ))}
              </Table>
              {!records?.length && <EmptyState icon={<FlaskConical className="w-8 h-8" />} title="No records found" />}
            </>
          )}
        </div>
      )}

      {/* Prescriptions */}
      {tab === 'prescriptions' && (
        <div className="card">
          {!selectedPatientId ? (
            <EmptyState icon={<Search className="w-8 h-8" />} title="Select a patient" description="Choose a patient above to view their prescriptions." />
          ) : loadRx ? <PageLoader /> : (
            <>
              <Table headers={['Date', 'Doctor', 'Valid Till', 'Notes', 'Status']}>
                {prescriptions?.map(p => (
                  <Tr key={p.prescription_id}>
                    <Td>{formatDate(p.prescribed_date)}</Td>
                    <Td>Dr. {p.doctor_name}</Td>
                    <Td className="text-[#4A5568]">{formatDate(p.valid_till)}</Td>
                    <Td className="text-xs text-[#4A5568]">{p.notes ?? '—'}</Td>
                    <Td><StatusBadge status={p.is_valid ? 'Active' : 'Cancelled'} /></Td>
                  </Tr>
                ))}
              </Table>
              {!prescriptions?.length && <EmptyState title="No prescriptions" />}
            </>
          )}
        </div>
      )}

      {/* Pending Lab */}
      {tab === 'lab' && (
        <div className="card">
          {loadLab ? <PageLoader /> : (
            <>
              <Table headers={['Test ID', 'Patient ID', 'Ordered', 'Status', 'Result', '']}>
                {pendingLab?.map(r => (
                  <Tr key={r.result_id}>
                    <Td className="font-mono text-xs">TEST-{r.test_id}</Td>
                    <Td className="font-mono text-xs">PT-{r.patient_id}</Td>
                    <Td className="text-[#4A5568]">{formatDate(r.ordered_date)}</Td>
                    <Td><StatusBadge status={r.status} /></Td>
                    <Td className="text-xs text-[#4A5568]">{r.result_value ?? '—'}</Td>
                    <Td>
                      <button
                        onClick={() => { setShowLabUpdate(r.result_id); setLabForm(f => ({ ...f, status: r.status })); }}
                        className="text-xs text-[#006B58] hover:underline"
                      >
                        Update
                      </button>
                    </Td>
                  </Tr>
                ))}
              </Table>
              {!pendingLab?.length && <EmptyState icon={<FlaskConical className="w-8 h-8" />} title="No pending lab results" />}
            </>
          )}
        </div>
      )}

      {/* Lab update modal */}
      <Modal open={!!showLabUpdate} onClose={() => setShowLabUpdate(null)} title="Update Lab Result" size="sm">
        <div className="space-y-4">
          <Select label="Status *" value={labForm.status} onChange={e => setLabForm(p => ({ ...p, status: e.target.value as LabResultStatus }))} options={LAB_STATUS_OPTIONS} />
          <Input label="Result Value" value={labForm.result_value} onChange={e => setLabForm(p => ({ ...p, result_value: e.target.value }))} />
          <Input label="Result Date" type="date" value={labForm.result_date} onChange={e => setLabForm(p => ({ ...p, result_date: e.target.value }))} />
          <Textarea label="Remarks" value={labForm.remarks} onChange={e => setLabForm(p => ({ ...p, remarks: e.target.value }))} rows={2} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowLabUpdate(null)}>Cancel</Button>
            <Button loading={updateLab.isPending} onClick={handleLabUpdate}>Update Result</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
