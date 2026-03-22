import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, User } from 'lucide-react';
import { usePatients, useCreatePatient } from '@/hooks';
import {
  SectionHeader, Button, Input, Select, Textarea, Modal, Table, Tr, Td,
  StatusBadge, Pagination, PageLoader, EmptyState, ErrorState
} from '@/components/shared';
import { formatDate, formatAge } from '@/lib/utils';
import type { CreatePatientInput } from '@/types';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(v => ({ value: v, label: v }));
const GENDER_OPTIONS = [
  { value: '', label: 'Select gender' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

export default function PatientsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading, isError, refetch } = usePatients({ page, limit: 20, search });
  const createMutation = useCreatePatient();

  const [form, setForm] = useState<Partial<CreatePatientInput>>({
    gender: 'Male',
  });
  const [formError, setFormError] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function updateForm(field: keyof CreatePatientInput, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!form.first_name || !form.last_name || !form.phone || !form.date_of_birth || !form.gender) {
      setFormError('Fill in all required fields.');
      return;
    }
    try {
      await createMutation.mutateAsync(form as CreatePatientInput);
      setShowCreate(false);
      setForm({ gender: 'Male' });
    } catch (err: any) {
      setFormError(err?.response?.data?.message ?? 'Failed to register patient.');
    }
  }

  return (
    <div>
      <SectionHeader
        title="Patients"
        description="Manage patient records and registrations"
        action={
          <Button icon={<UserPlus className="w-4 h-4" />} onClick={() => setShowCreate(true)}>
            Register Patient
          </Button>
        }
      />

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4A5568]" />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by name, phone or email…"
            className="input pl-9 pr-4"
          />
        </div>
        <Button type="submit" variant="secondary">Search</Button>
        {search && (
          <Button variant="ghost" type="button" onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}>
            Clear
          </Button>
        )}
      </form>

      {/* Table */}
      <div className="card">
        {isLoading ? <PageLoader /> : isError ? (
          <ErrorState onRetry={refetch} />
        ) : (
          <>
            <Table headers={['Patient', 'Age', 'Gender', 'Blood Group', 'Phone', 'Visits', 'Registered']}>
              {data?.data.map(p => (
                <Tr key={p.patient_id} onClick={() => navigate(`/patients/${p.patient_id}`)}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#006B58]/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-[#006B58]">
                          {p.first_name[0]}{p.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-[#1A2332]">{p.first_name} {p.last_name}</p>
                        <p className="text-xs text-[#4A5568]">{p.email ?? 'No email'}</p>
                      </div>
                    </div>
                  </Td>
                  <Td className="text-[#4A5568]">{p.age ? `${p.age} yrs` : formatAge(p.date_of_birth)}</Td>
                  <Td className="text-[#4A5568]">{p.gender}</Td>
                  <Td>
                    {p.blood_group
                      ? <span className="font-mono text-xs font-semibold text-[#006B58]">{p.blood_group}</span>
                      : <span className="text-[#4A5568]">—</span>
                    }
                  </Td>
                  <Td className="font-mono text-xs">{p.phone}</Td>
                  <Td className="text-[#4A5568]">{p.total_visits ?? 0}</Td>
                  <Td className="text-[#4A5568]">{formatDate(p.created_at)}</Td>
                </Tr>
              ))}
            </Table>
            {data?.data.length === 0 && (
              <EmptyState icon={<User className="w-8 h-8" />} title="No patients found" description={search ? 'Try a different search term.' : 'Register your first patient.'} />
            )}
            {data?.meta && (
              <Pagination {...data.meta} onPage={setPage} />
            )}
          </>
        )}
      </div>

      {/* Register modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Register New Patient" size="lg">
        <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
          <Input label="First Name *" value={form.first_name ?? ''} onChange={e => updateForm('first_name', e.target.value)} required />
          <Input label="Last Name *" value={form.last_name ?? ''} onChange={e => updateForm('last_name', e.target.value)} required />
          <Input label="Date of Birth *" type="date" value={form.date_of_birth ?? ''} onChange={e => updateForm('date_of_birth', e.target.value)} required />
          <Select label="Gender *" value={form.gender ?? ''} onChange={e => updateForm('gender', e.target.value)} options={GENDER_OPTIONS} required />
          <Input label="Phone *" value={form.phone ?? ''} onChange={e => updateForm('phone', e.target.value)} required />
          <Select label="Blood Group" value={form.blood_group ?? ''} onChange={e => updateForm('blood_group', e.target.value)} options={[{ value: '', label: 'Unknown' }, ...BLOOD_GROUPS]} />
          <Input label="Email" type="email" value={form.email ?? ''} onChange={e => updateForm('email', e.target.value)} className="col-span-2" />
          <Textarea label="Address" value={form.address ?? ''} onChange={e => updateForm('address', e.target.value)} rows={2} className="col-span-2" />
          <Input label="Emergency Contact Name" value={form.emergency_contact_name ?? ''} onChange={e => updateForm('emergency_contact_name', e.target.value)} />
          <Input label="Emergency Contact Phone" value={form.emergency_contact_phone ?? ''} onChange={e => updateForm('emergency_contact_phone', e.target.value)} />
          <Textarea label="Known Allergies" value={form.allergies ?? ''} onChange={e => updateForm('allergies', e.target.value)} rows={2} className="col-span-2" />

          {formError && <p className="col-span-2 text-xs text-[#BA1A1A]">{formError}</p>}

          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Register Patient</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
