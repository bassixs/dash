import { vi, describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFilteredData } from './useFilteredData';
import { useDashboardStore } from '../../../shared/store/useDashboardStore';
import { ProjectRecordInterface } from '../../../core/models/ProjectRecord';

vi.mock('../../../shared/store/useDashboardStore', () => ({
  useDashboardStore: vi.fn(),
}));

describe('useFilteredData', () => {
  const mockData: ProjectRecordInterface[] = [
    { link: 'a', views: 100, si: 50, er: 0.05, project: 'P1', period: '2023-01' },
    { link: 'b', views: 200, si: 100, er: 0.1, project: 'P2', period: '2023-02' },
  ];

  it('filters by project', () => {
    vi.mocked(useDashboardStore).mockReturnValue({
      selectedProject: 'P1',
      selectedPeriod: '',
      setSelectedProject: vi.fn(),
      setSelectedPeriod: vi.fn(),
      resetFilters: vi.fn(),
    });

    const { result } = renderHook(() => useFilteredData(mockData));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].project).toBe('P1');
  });

  it('filters by period', () => {
    vi.mocked(useDashboardStore).mockReturnValue({
      selectedProject: '',
      selectedPeriod: '2023-01',
      setSelectedProject: vi.fn(),
      setSelectedPeriod: vi.fn(),
      resetFilters: vi.fn(),
    });

    const { result } = renderHook(() => useFilteredData(mockData));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].period).toBe('2023-01');
  });

  it('returns all data when no filters applied', () => {
    vi.mocked(useDashboardStore).mockReturnValue({
      selectedProject: '',
      selectedPeriod: '',
      setSelectedProject: vi.fn(),
      setSelectedPeriod: vi.fn(),
      resetFilters: vi.fn(),
    });

    const { result } = renderHook(() => useFilteredData(mockData));
    expect(result.current).toHaveLength(2);
  });
});