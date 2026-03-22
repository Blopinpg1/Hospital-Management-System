import { useState } from 'react';
import { BedDouble, PlusCircle, List, AlertTriangle } from 'lucide-react';
import {
  useActiveAdmissions, useAdmissions, useBedOccupancy, useAvailableBeds,
  useWaitingList, useAdmitPatient, useDischargePatient, useDoctors, usePatients,
} from '@/hooks';
import {
  SectionHeader, Button, Modal, Select, Input, Textarea,
  Table, Tr, Td, StatusBadge, PageLoader, EmptyState, Pagination, StatCard, ErrorState
} from '@/components/shared';
import { formatDate, cn } from '@/lib/utils';
import type { VisitType } from '@/types';

type TabId = 'active' | 'all' | 'beds' | 'waiting';

export default function AdmissionsPage() {
  const [tab, setTab] = useState<TabId>('active');
  const [page, setPage] = useState(1);
  const [showAdmit, setShowAdmit] = useState(false);
  const [showDischarge, setShowDischarge] = useState<number | null>(null);
  const [formError, setFormError] = useState('');
  const [dischargeData, setDischargeData] = useState({ summary: '', discount_pct: '0' });

  const { data: active, isLoading: loadActive } = useActiveAdmissions();
  const { data: all, isLoading: loadAll } = useAdmissions({ page, limit: 20 });
  const { data: bedData, isLoading: loadBeds } = useBedOccupancy();
  const { data: waiting, isLoading: loadWaiting } = useWaitingList();
  const { data: availBeds } = useAvailableBeds();
  const { data: doctors } = useDoctors();
  const { data: patients } = usePatients({ limit: 100 });

  const admitMutation = useAdmitPatient();
  const dischargeMutation = useDischargePatient();

  const [admitForm, setAdmitForm] = useState({
    patient_id: '', doctor_id: '', bed_id: '',
    visit_type: 'Planned' as VisitType, reason: '', exp_discharge: '',
  });

  async function handleAdmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    try {
      await admitMutation.mutateAsync({
        patient_id: parseInt(admitForm.patient_id),
        doctor_id: parseInt(admitForm.doctor_id),
        bed_id: admitForm.bed_id ? parseInt(admitForm.bed_id) : undefined,
        visit_type: admitForm.visit_type,
        reason: admitForm.reason || undefined,
        exp_discharge: admitForm.exp_discharge || undefined,
      });
      setShowAdmit(false);
    } catch (err: any) {
      setFormError(err?.response?.data?.message ?? 'Failed to admit patient.');
    }
  }

  async function handleDischarge() {
    if (!showDischarge) return;
    await dischargeMutation.mutateAsync({
      id: showDischarge,
      summary: dischargeData.summary || undefined,
      discount_pct: parseFloat(dischargeData.discount_pct) || 0,
    });
    setShowDischarge(null);
    setDischargeData({ summary: '', discount_pct: '0' });
  }

  const patientOptions = [{ value: '', label: 'Select patient' }, ...(patients?.data.map(p => ({ value: String(p.patient_id), label: `${p.first_name} ${p.last_name}` })) ?? [])];
  const doctorOptions = [{ value: '', label: 'Select doctor' }, ...(doctors?.map(d => ({ value: String(d.doctor_id), label: `Dr. ${d.first_name} ${d.last_name}` })) ?? [])];
  const bedOptions = [{ value: '', label: 'Auto-assign bed' }, ...(availBeds?.map(b => ({ value: String(b.bed_id), label: `${b.room_number} — Bed ${b.bed_number} (${b.room_type})` })) ?? [])];
  const visitTypeOptions = ['Emergency', 'Planned', 'Transfer'].map(v => ({ value: v, label: v }));

  const tabs: { id: TabId; label: string }[] = [
    { id: 'active', label: `Active (${active?.length ?? '…'})` },
    { id: 'all', label: 'All Admissions' },
    { id: 'beds', label: 'Bed Map' },
    { id: 'waiting', label: `Waiting (${waiting?.length ?? '…'})` },
  ];

  return (
    <div>
      <SectionHeader
        title="Admissions"
        description="Inpatient management, bed occupancy and waiting list"
        action={<Button icon={<PlusCircle className="w-4 h-4" />} onClick={() => setShowAdmit(true)}>Admit Patient</Button>}
      />

      {/* Tab selector */}
      <div className="flex gap-1 bg-[#F0F4F8] rounded-xl p-1 w-fit mb-6 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn(
            'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all',
            tab === t.id ? 'bg-white text-[#006B58] shadow-md' : 'text-[#4A5568] hover:text-[#1A2332]'
          )}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Active admissions */}
      {tab === 'active' && (
        <div className="card">
          {loadActive ? <PageLoader /> : (
            <>
              <Table headers={['Patient', 'Room / Bed', 'Doctor', 'Visit Type', 'Days', 'Exp. Discharge', '']}>
                {active?.map(a => (
                  <Tr key={a.admission_id}>
                    <Td>
                      <p className="font-medium">{a.patient_name}</p>
                      <p className="text-xs text-[#4A5568]">{a.patient_phone}</p>
                      {a.blood_group && <span className="font-mono text-xs text-[#006B58]">{a.blood_group}</span>}
                    </Td>
                    <Td>
                      <p className="font-medium">{a.room_number}</p>
                      <p className="text-xs text-[#4A5568]">Bed {a.bed_number} · {a.room_type}</p>
                    </Td>
                    <Td>Dr. {a.admitting_doctor}</Td>
                    <Td><StatusBadge status={a.visit_type ?? ''} /></Td>
                    <Td className="font-mono text-sm">{a.days_admitted ?? 0}d</Td>
                    <Td className="text-[#4A5568]">{formatDate(a.expected_discharge)}</Td>
                    <Td>
                      <button
                        onClick={() => setShowDischarge(a.admission_id)}
                        className="text-xs text-[#BA1A1A] hover:underline"
                      >
                        Discharge
                      </button>
                    </Td>
                  </Tr>
                ))}
              </Table>
              {!active?.length && <EmptyState icon={<BedDouble className="w-8 h-8" />} title="No active admissions" />}
            </>
          )}
        </div>
      )}

      {/* All admissions */}
      {tab === 'all' && (
        <div className="card">
          {loadAll ? <PageLoader /> : (
            <>
              <Table headers={['Patient', 'Doctor', 'Room', 'Type', 'Admitted', 'Status']}>
                {all?.data.map(a => (
                  <Tr key={a.admission_id}>
                    <Td><p className="font-medium">{a.patient_name}</p></Td>
                    <Td>Dr. {a.doctor_name}</Td>
                    <Td>{a.room_number} / {a.bed_number}</Td>
                    <Td><StatusBadge status={a.visit_type} /></Td>
                    <Td className="text-[#4A5568]">{formatDate(a.admission_date)}</Td>
                    <Td><StatusBadge status={a.status} /></Td>
                  </Tr>
                ))}
              </Table>
              {all?.meta && <Pagination {...all.meta} onPage={setPage} />}
            </>
          )}
        </div>
      )}

      {/* Bed map */}
      {tab === 'beds' && (
        <div>
          {loadBeds ? <PageLoader /> : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {bedData?.summary.map(s => (
                  <StatCard
                    key={s.room_type}
                    label={s.room_type}
                    value={`${s.occupied}/${s.total_beds}`}
                    sub={`${s.available} available`}
                  />
                ))}
              </div>

              {/* Beds grid */}
              <div className="card">
                <h2 className="text-sm font-semibold text-[#1A2332] mb-4">All Beds</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                  {/* Occupied beds — from bed-occupancy endpoint (have patient_name) */}
                  {bedData?.beds.map(b => (
                    <div
                      key={`occ-${b.bed_id}`}
                      style={{ backgroundColor: '#FFDAD6' }}
                      className="rounded-lg p-2.5 text-center relative"
                    >
                      <span style={{ backgroundColor: '#ef4444' }} className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" />
                      <p className="text-xs font-semibold text-[#1A2332]">{b.bed_number}</p>
                      <p className="text-xs text-[#4A5568] truncate">{b.room_number}</p>
                      <p className="text-xs truncate text-[#1A2332] mt-0.5 font-medium">{(b as any).patient_name ?? 'Occupied'}</p>
                    </div>
                  ))}
                  {/* Available beds — from available-beds endpoint */}
                  {availBeds?.map(b => (
                    <div
                      key={`avail-${b.bed_id}`}
                      style={{ backgroundColor: '#D1F5E0' }}
                      className="rounded-lg p-2.5 text-center relative"
                    >
                      <span style={{ backgroundColor: '#22c55e' }} className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" />
                      <p className="text-xs font-semibold text-[#1A2332]">{b.bed_number}</p>
                      <p className="text-xs text-[#4A5568] truncate">{b.room_number}</p>
                      <p className="text-xs text-[#4A5568] mt-0.5">Free</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-5 mt-4 text-xs text-[#4A5568]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />Available ({availBeds?.length ?? 0})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />Occupied ({bedData?.beds.length ?? 0})
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Waiting list */}
      {tab === 'waiting' && (
        <div className="card">
          {loadWaiting ? <PageLoader /> : (
            <>
              <Table headers={['Patient', 'Doctor', 'Visit Type', 'Reason', 'Added']}>
                {waiting?.map(w => (
                  <Tr key={w.waiting_id}>
                    <Td><p className="font-medium">{w.patient_name}</p></Td>
                    <Td>Doctor #{w.doctor_id}</Td>
                    <Td><StatusBadge status={w.visit_type} /></Td>
                    <Td className="text-[#4A5568] text-xs">{w.reason ?? '—'}</Td>
                    <Td className="text-[#4A5568]">{formatDate(w.added_at)}</Td>
                  </Tr>
                ))}
              </Table>
              {!waiting?.length && <EmptyState icon={<List className="w-8 h-8" />} title="Waiting list is empty" />}
            </>
          )}
        </div>
      )}

      {/* Admit modal */}
      <Modal open={showAdmit} onClose={() => setShowAdmit(false)} title="Admit Patient" size="md">
        <form onSubmit={handleAdmit} className="space-y-4">
          <Select label="Patient *" value={admitForm.patient_id} onChange={e => setAdmitForm(p => ({ ...p, patient_id: e.target.value }))} options={patientOptions} required />
          <Select label="Doctor *" value={admitForm.doctor_id} onChange={e => setAdmitForm(p => ({ ...p, doctor_id: e.target.value }))} options={doctorOptions} required />
          <Select label="Bed" value={admitForm.bed_id} onChange={e => setAdmitForm(p => ({ ...p, bed_id: e.target.value }))} options={bedOptions} />
          <Select label="Visit Type *" value={admitForm.visit_type} onChange={e => setAdmitForm(p => ({ ...p, visit_type: e.target.value as VisitType }))} options={visitTypeOptions} required />
          <Input label="Expected Discharge" type="date" value={admitForm.exp_discharge} onChange={e => setAdmitForm(p => ({ ...p, exp_discharge: e.target.value }))} />
          <Textarea label="Reason" value={admitForm.reason} onChange={e => setAdmitForm(p => ({ ...p, reason: e.target.value }))} rows={2} />
          {formError && <p className="text-xs text-[#BA1A1A]">{formError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setShowAdmit(false)}>Cancel</Button>
            <Button type="submit" loading={admitMutation.isPending}>Admit Patient</Button>
          </div>
        </form>
      </Modal>

      {/* Discharge modal */}
      <Modal open={!!showDischarge} onClose={() => setShowDischarge(null)} title="Discharge Patient" size="sm">
        <div className="space-y-4">
          <Textarea label="Discharge Summary" value={dischargeData.summary} onChange={e => setDischargeData(p => ({ ...p, summary: e.target.value }))} rows={3} placeholder="Optional clinical notes…" />
          <Input label="Discount (%)" type="number" min="0" max="100" value={dischargeData.discount_pct} onChange={e => setDischargeData(p => ({ ...p, discount_pct: e.target.value }))} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setShowDischarge(null)}>Cancel</Button>
            <Button variant="danger" loading={dischargeMutation.isPending} onClick={handleDischarge}>Confirm Discharge</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}