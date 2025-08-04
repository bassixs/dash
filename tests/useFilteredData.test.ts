import { renderHook } from '@testing-library/react';
import { useFilteredData } from '@features/dashboard/hooks/useFilteredData';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDashboardStore } from '@shared/store/useDashboardStore';
import { ProjectRecordInterface } from '@core/models/ProjectRecord';

// Мокаем zustand store
vi.mock('@shared/store/useDashboardStore', () => ({
  useDashboardStore: vi.fn(),
}));

describe('useFilteredData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filters data by project and period', () => {
    const mockStore = {
      selectedProject: 'Test Project',
      selectedPeriod: '14.07 - 20.07',
      setSelectedProject: vi.fn(),
      setSelectedPeriod: vi.fn(),
      resetFilters: vi.fn(),
    };
    
    vi.mocked(useDashboardStore).mockImplementation(() => mockStore);
    
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

  it('returns all data when no filters are selected', () => {
    const mockStore = {
      selectedProject: '',
      selectedPeriod: '',
      setSelectedProject: vi.fn(),
      setSelectedPeriod: vi.fn(),
      resetFilters: vi.fn(),
    };
    
    vi.mocked(useDashboardStore).mockImplementation(() => mockStore);
    
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
    expect(result.current).toEqual(data);
  });
});