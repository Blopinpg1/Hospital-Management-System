import { Users, Calendar, BedDouble, AlertCircle, TrendingUp, Clock } from 'lucide-react';
import {
  useTodaysAppointments, useActiveAdmissions, useBedOccupancy,
  useOutstandingBills, useLowStock,
} from '@/hooks';
import { StatCard, StatusBadge, PageLoader, Table, Tr, Td } from '@/components/shared';
import { formatTime, formatCurrency, formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { data: todayAppts, isLoading: loadAppts } = useTodaysAppointments();
  const { data: activeAdmissions } = useActiveAdmissions();
  const { data: bedData } = useBedOccupancy();
  const { data: outstanding } = useOutstandingBills();
  const { data: lowStock } = useLowStock();

  // MySQL returns numeric columns as strings — coerce with Number() to prevent string concatenation
  const totalBeds     = bedData?.summary.reduce((s, r) => s + Number(r.total_beds), 0) ?? 0;
  const occupiedBeds  = bedData?.summary.reduce((s, r) => s + Number(r.occupied),   0) ?? 0;
  const availableBeds = bedData?.summary.reduce((s, r) => s + Number(r.available),  0)
    ?? Math.max(0, totalBeds - occupiedBeds);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const totalOutstanding = outstanding?.reduce((s, b) => s + Number(b.balance_due), 0) ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-sans font-semibold text-[#1A2332]">Dashboard</h1>
        <p className="text-sm text-[#4A5568] mt-0.5">{formatDate(new Date().toISOString(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Appointments"
          value={todayAppts?.length ?? '—'}
          sub={`${todayAppts?.filter(a => a.status === 'Completed').length ?? 0} completed`}
          icon={<Calendar className="w-4 h-4" />}
        />
        <StatCard
          label="Active Admissions"
          value={activeAdmissions?.length ?? '—'}
          sub={`${occupancyRate}% occupancy`}
          icon={<BedDouble className="w-4 h-4" />}
        />
        <StatCard
          label="Available Beds"
          value={availableBeds}
          sub={`of ${totalBeds} total`}
          icon={<Users className="w-4 h-4" />}
        />
        <StatCard
          label="Outstanding Bills"
          value={outstanding?.length ?? '—'}
          sub={formatCurrency(totalOutstanding)}
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </div>

      {/* Alerts row */}
      {(lowStock && lowStock.length > 0) && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200/60 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">{lowStock.length} medicines</span> are low on stock or expiring soon.
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Today's appointments */}
        <div className="lg:col-span-3 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#1A2332] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#006B58]" /> Today's Appointments
            </h2>
            <span className="text-xs text-[#4A5568]">{todayAppts?.length ?? 0} total</span>
          </div>

          {loadAppts ? <PageLoader /> : (
            <div className="divide-y divide-[#C0C8BB]/20">
              {todayAppts?.length === 0 && (
                <p className="text-sm text-[#4A5568] py-8 text-center">No appointments today.</p>
              )}
              {todayAppts?.map(appt => (
                <div key={appt.appointment_id} className="flex items-center gap-4 py-3">
                  <div className="w-10 shrink-0 text-center">
                    <p className="text-xs font-mono font-medium text-[#006B58]">{formatTime(appt.appointment_time)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A2332]">{appt.patient_name}</p>
                    <p className="text-xs text-[#4A5568] truncate">
                      Dr. {appt.doctor_name} · {appt.department ?? appt.specialization ?? 'General'}
                    </p>
                  </div>
                  <StatusBadge status={appt.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bed occupancy by room type */}
        <div className="lg:col-span-2 card">
          <h2 className="text-sm font-semibold text-[#1A2332] mb-4">Bed Occupancy by Type</h2>
          <div className="space-y-3">
            {bedData?.summary.map(s => {
              const total    = Number(s.total_beds);
              const occupied = Number(s.occupied);
              const pct      = total > 0 ? Math.min(100, Math.round((occupied / total) * 100)) : 0;
              return (
                <div key={s.room_type}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#4A5568]">{s.room_type}</span>
                    <span className="font-medium text-[#1A2332]">{occupied}/{total} · {pct}%</span>
                  </div>
                  <div className="h-1.5 bg-[#DCE4EC] rounded-full overflow-hidden">
                    <div
                      className="h-full progress-bar rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {!bedData?.summary.length && (
              <p className="text-xs text-[#4A5568] py-8 text-center">No bed data.</p>
            )}
          </div>
        </div>
      </div>

      {/* Outstanding bills */}
      {outstanding && outstanding.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-[#1A2332] mb-4">Outstanding Bills</h2>
          <Table headers={['Patient', 'Bill Date', 'Total', 'Balance Due', 'Days Overdue', 'Status']}>
            {outstanding.slice(0, 8).map(b => (
              <Tr key={b.bill_id}>
                <Td>
                  <div>
                    <p className="font-medium">{b.patient_name}</p>
                    <p className="text-xs text-[#4A5568]">{b.phone}</p>
                  </div>
                </Td>
                <Td className="text-[#4A5568]">{formatDate(b.bill_date)}</Td>
                <Td>{formatCurrency(Number(b.total_amount))}</Td>
                <Td className="font-medium text-[#BA1A1A]">{formatCurrency(Number(b.balance_due))}</Td>
                <Td>
                  <span className={Number(b.days_overdue) > 0 ? 'text-[#BA1A1A] text-xs font-medium' : 'text-[#4A5568] text-xs'}>
                    {Number(b.days_overdue) > 0 ? `${b.days_overdue}d overdue` : 'On time'}
                  </span>
                </Td>
                <Td><StatusBadge status={b.status} /></Td>
              </Tr>
            ))}
          </Table>
        </div>
      )}
    </div>
  );
}