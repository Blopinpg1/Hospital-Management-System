import { useState } from 'react';
import { Receipt, TrendingUp, AlertCircle, PlusCircle } from 'lucide-react';
import {
  useBills, useOutstandingBills, useDoctorRevenue,
  useCreateBill, useMakePayment, usePatients,
} from '@/hooks';
import {
  SectionHeader, Button, Modal, Input, Select, Table, Tr, Td,
  StatusBadge, Pagination, PageLoader, EmptyState, StatCard
} from '@/components/shared';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import type { PaymentMethod } from '@/types';

type TabId = 'bills' | 'outstanding' | 'revenue';

const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Card', 'Bank Transfer', 'Mobile Payment', 'Insurance'];

export default function BillingPage() {
  const [tab, setTab] = useState<TabId>('bills');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [showPayment, setShowPayment] = useState<number | null>(null);
  const [createForm, setCreateForm] = useState({ patient_id: '', appointment_id: '', admission_id: '', discount_pct: '0' });
  const [payForm, setPayForm] = useState({ amount: '', method: 'Cash' as PaymentMethod, reference_no: '' });
  const [formError, setFormError] = useState('');

  const { data: bills, isLoading: loadBills } = useBills({ page, limit: 20 });
  const { data: outstanding, isLoading: loadOut } = useOutstandingBills();
  const { data: doctorRev } = useDoctorRevenue();
  const { data: patients } = usePatients({ limit: 200 });
  const createMutation = useCreateBill();
  const payMutation = useMakePayment();

  const totalOutstanding = outstanding?.reduce((s, b) => s + Number(b.balance_due), 0) ?? 0;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    try {
      await createMutation.mutateAsync({
        patient_id: parseInt(createForm.patient_id),
        appointment_id: createForm.appointment_id ? parseInt(createForm.appointment_id) : undefined,
        admission_id: createForm.admission_id ? parseInt(createForm.admission_id) : undefined,
        discount_pct: parseFloat(createForm.discount_pct) || 0,
      });
      setShowCreate(false);
    } catch (err: any) {
      setFormError(err?.response?.data?.message ?? 'Failed to generate bill.');
    }
  }

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!showPayment) return;
    await payMutation.mutateAsync({
      id: showPayment,
      amount: parseFloat(payForm.amount),
      method: payForm.method,
      reference_no: payForm.reference_no || undefined,
    });
    setShowPayment(null);
    setPayForm({ amount: '', method: 'Cash', reference_no: '' });
  }

  const patientOptions = [
    { value: '', label: 'Select patient' },
    ...(patients?.data.map(p => ({ value: String(p.patient_id), label: `${p.first_name} ${p.last_name}` })) ?? []),
  ];

  const tabs: { id: TabId; label: string }[] = [
    { id: 'bills', label: 'All Bills' },
    { id: 'outstanding', label: `Outstanding (${outstanding?.length ?? '…'})` },
    { id: 'revenue', label: 'Revenue by Doctor' },
  ];

  return (
    <div>
      <SectionHeader
        title="Billing"
        description="Manage bills, payments and revenue reports"
        action={<Button icon={<PlusCircle className="w-4 h-4" />} onClick={() => setShowCreate(true)}>Generate Bill</Button>}
      />

      {/* Quick stats */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <StatCard label="Outstanding Balance" value={formatCurrency(totalOutstanding)} icon={<AlertCircle className="w-4 h-4" />} />
      </div>

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

      {/* Bills */}
      {tab === 'bills' && (
        <div className="card">
          {loadBills ? <PageLoader /> : (
            <>
              <Table headers={['Patient', 'Date', 'Total', 'Paid', 'Balance', 'Status', '']}>
                {bills?.data.map(b => (
                  <Tr key={b.bill_id}>
                    <Td>
                      <p className="font-medium">{b.patient_name}</p>
                      <p className="text-xs text-[#4A5568] font-mono">BILL-{b.bill_id}</p>
                    </Td>
                    <Td className="text-[#4A5568]">{formatDate(b.bill_date)}</Td>
                    <Td>{formatCurrency(Number(b.total_amount))}</Td>
                    <Td className="text-[#102009]">{formatCurrency(Number(b.amount_paid))}</Td>
                    <Td className={Number(b.total_amount) - Number(b.amount_paid) > 0 ? 'text-[#BA1A1A] font-medium' : 'text-[#4A5568]'}>
                      {formatCurrency(Number(b.total_amount) - Number(b.amount_paid))}
                    </Td>
                    <Td><StatusBadge status={b.status} /></Td>
                    <Td>
                      {b.status !== 'Paid' && b.status !== 'Cancelled' && (
                        <button onClick={() => setShowPayment(b.bill_id)} className="text-xs text-[#006B58] hover:underline">
                          Pay
                        </button>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Table>
              {bills?.meta && <Pagination {...bills.meta} onPage={setPage} />}
              {!bills?.data.length && <EmptyState icon={<Receipt className="w-8 h-8" />} title="No bills found" />}
            </>
          )}
        </div>
      )}

      {/* Outstanding */}
      {tab === 'outstanding' && (
        <div className="card">
          {loadOut ? <PageLoader /> : (
            <Table headers={['Patient', 'Bill Date', 'Total', 'Balance Due', 'Days Overdue', 'Status']}>
              {outstanding?.map(b => (
                <Tr key={b.bill_id}>
                  <Td>
                    <p className="font-medium">{b.patient_name}</p>
                    <p className="text-xs text-[#4A5568]">{b.phone}</p>
                  </Td>
                  <Td className="text-[#4A5568]">{formatDate(b.bill_date)}</Td>
                  <Td>{formatCurrency(Number(b.total_amount))}</Td>
                  <Td className="font-medium text-[#BA1A1A]">{formatCurrency(Number(b.balance_due))}</Td>
                  <Td>
                    <span className={Number(b.days_overdue) > 0 ? 'text-[#BA1A1A] text-xs' : 'text-[#4A5568] text-xs'}>
                      {Number(b.days_overdue) > 0 ? `${b.days_overdue}d overdue` : 'On time'}
                    </span>
                  </Td>
                  <Td><StatusBadge status={b.status} /></Td>
                </Tr>
              ))}
              {!outstanding?.length && <EmptyState title="No outstanding bills" />}
            </Table>
          )}
        </div>
      )}

      {/* Revenue by Doctor */}
      {tab === 'revenue' && (
        <div className="card">
          <h2 className="text-sm font-semibold text-[#1A2332] mb-4">Revenue by Doctor</h2>
          <Table headers={['Doctor', 'Specialization', 'Consultations', 'Revenue']}>
            {doctorRev?.map(d => (
              <Tr key={d.doctor_name}>
                <Td><p className="font-medium text-xs">{d.doctor_name}</p></Td>
                <Td className="text-xs text-[#4A5568]">{d.specialization ?? '—'}</Td>
                <Td className="text-xs">{d.total_consultations}</Td>
                <Td className="text-xs font-medium">{formatCurrency(Number(d.total_revenue))}</Td>
              </Tr>
            ))}
          </Table>
          {!doctorRev?.length && <EmptyState icon={<TrendingUp className="w-8 h-8" />} title="No revenue data" />}
        </div>
      )}

      {/* Create bill modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Generate Bill" size="sm">
        <form onSubmit={handleCreate} className="space-y-4">
          <Select label="Patient *" value={createForm.patient_id} onChange={e => setCreateForm(p => ({ ...p, patient_id: e.target.value }))} options={patientOptions} required />
          <Input label="Appointment ID (optional)" type="number" value={createForm.appointment_id} onChange={e => setCreateForm(p => ({ ...p, appointment_id: e.target.value }))} />
          <Input label="Admission ID (optional)" type="number" value={createForm.admission_id} onChange={e => setCreateForm(p => ({ ...p, admission_id: e.target.value }))} />
          <Input label="Discount (%)" type="number" min="0" max="100" value={createForm.discount_pct} onChange={e => setCreateForm(p => ({ ...p, discount_pct: e.target.value }))} />
          {formError && <p className="text-xs text-[#BA1A1A]">{formError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Generate Bill</Button>
          </div>
        </form>
      </Modal>

      {/* Payment modal */}
      <Modal open={!!showPayment} onClose={() => setShowPayment(null)} title="Record Payment" size="sm">
        <form onSubmit={handlePayment} className="space-y-4">
          <Input label="Amount (NPR) *" type="number" min="1" step="0.01" value={payForm.amount} onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))} required />
          <Select label="Payment Method *" value={payForm.method} onChange={e => setPayForm(p => ({ ...p, method: e.target.value as PaymentMethod }))} options={PAYMENT_METHODS.map(m => ({ value: m, label: m }))} />
          <Input label="Reference No. (optional)" value={payForm.reference_no} onChange={e => setPayForm(p => ({ ...p, reference_no: e.target.value }))} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowPayment(null)}>Cancel</Button>
            <Button type="submit" loading={payMutation.isPending}>Record Payment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}