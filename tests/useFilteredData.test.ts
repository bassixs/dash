import { renderHook } from '@testing-library/react';
import { useFilteredData } from '@features/dashboard/hooks/useFilteredData';
import { describe, it, expect, vi } from 'vitest';
import { useDashboardStore } from '@shared/store/useDashboardStore';
import { ProjectRecordInterface } from '@core/models/ProjectRecord';

describe('useFilteredData', () => {
  it('filters data by project and period', () => {
    vi.mocked(useDashboardStore).mockReturnValue({
      selectedProject: 'Test Project',
      selectedPeriod: '14.07 - 20.07',
      setSelectedProject: vi.fn(),
      setSelectedPeriod: vi.fn(),
      resetFilters: vi.fn(),
    });
    const data: ProjectRecordInterface[] = [
      {
        link: 'https://example.com',
        views: 1000,
        si: 500,
        er: 0.05,
        project: 'Test Project',
        period: '14.07 - 20.07',
      },
      {
        link: 'https://example2.com',
        views: 2000,
        si: 1000,
        er: 0.1,
        project: 'Other Project',
        period: '21.07 - 27.07',
      },
    ];
    const { result } = renderHook(() => useFilteredData(data));
    expect(result.current).toEqual([data[0]]);
  });
});