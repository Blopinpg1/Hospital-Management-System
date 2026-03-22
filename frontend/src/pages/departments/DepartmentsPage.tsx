import { Building2, Stethoscope, MapPin } from 'lucide-react';
import { useDepartments } from '@/hooks';
import { SectionHeader, PageLoader, EmptyState } from '@/components/shared';
import { formatDate } from '@/lib/utils';

export default function DepartmentsPage() {
  const { data: departments, isLoading } = useDepartments();

  return (
    <div>
      <SectionHeader
        title="Departments"
        description="Hospital departments and their medical staff"
      />

      {isLoading ? <PageLoader /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments?.map(d => (
            <div key={d.department_id} className="card-hover">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg,#006B58,#00A68A)' }}>
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-[#1A2332]">{d.name}</h3>
                  {d.description && (
                    <p className="text-xs text-[#4A5568] mt-0.5 line-clamp-2">{d.description}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {d.location && (
                  <div className="flex items-center gap-2 text-xs text-[#4A5568]">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{d.location}</span>
                  </div>
                )}
                {d.head_doctor_name && (
                  <div className="flex items-center gap-2 text-xs text-[#4A5568]">
                    <Stethoscope className="w-3 h-3 shrink-0" />
                    <span>Head: Dr. {d.head_doctor_name}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-[#C0C8BB]/20 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-sans font-semibold text-[#006B58]">{d.doctor_count}</span>
                  <span className="text-xs text-[#4A5568]">active doctors</span>
                </div>
                <span className="text-xs text-[#4A5568]">
                  Since {formatDate(d.created_at, 'MMM yyyy')}
                </span>
              </div>
            </div>
          ))}
          {!departments?.length && (
            <div className="col-span-3">
              <EmptyState icon={<Building2 className="w-8 h-8" />} title="No departments found" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
