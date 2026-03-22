import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, differenceInDays } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined, fmt = 'MMM d, yyyy'): string {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, fmt);
  } catch {
    return '—';
  }
}

export function formatTime(time: string | null | undefined): string {
  if (!time) return '—';
  try {
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  } catch {
    return time;
  }
}

export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount == null || amount === '') return '—';
  const num = Number(amount);
  if (isNaN(num)) return '—';
  return `NPR ${num.toLocaleString('en-NP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatAge(dob: string | null | undefined): string {
  if (!dob) return '—';
  try {
    const days = differenceInDays(new Date(), parseISO(dob));
    const years = Math.floor(days / 365);
    return `${years} yrs`;
  } catch {
    return '—';
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusChip(status: string): string {
  const base = 'text-xs font-medium px-2.5 py-1 rounded-sm';
  const green = `${base} bg-[#CCE8C2] text-[#102009]`;
  const red   = `${base} bg-[#FFDAD6] text-[#410002]`;
  const grey  = `${base} bg-[#DCE4EC] text-[#4A5568]`;
  const amber = `${base} bg-amber-100 text-amber-800`;
  const blue  = `${base} bg-blue-100 text-blue-700`;
  const orange= `${base} bg-orange-100 text-orange-700`;

  const map: Record<string, string> = {
    Active:           green,
    Confirmed:        green,
    Paid:             green,
    OK:               green,
    Inpatient:        green,
    Scheduled:        amber,
    Pending:          amber,
    Ordered:          amber,
    'LOW STOCK':      amber,
    'Partially Paid': amber,
    Completed:        blue,
    'In Progress':    blue,
    Cancelled:        grey,
    'No-Show':        grey,
    Discharged:       grey,
    Draft:            grey,
    Outpatient:       red,
    'OUT OF STOCK':   red,
    'EXPIRING SOON':  orange,
    Emergency:        red,
    Planned:          blue,
    Transfer:         amber,
  };
  return map[status] ?? grey;
}