import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FiltersPanel from '@features/dashboard/components/FiltersPanel';
import { useDashboardStore } from '@shared/store/useDashboardStore';
import { useExcelData } from '@features/dashboard/hooks/useExcelData';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UseQueryResult } from '@tanstack/react-query';
import { ProjectRecordInterface } from '@core/models/ProjectRecord';

interface ExcelData {
  data: ProjectRecordInterface[];
  projects: string[];
}

// Мокаем хуки
vi.mock('@features/dashboard/hooks/useExcelData');
vi.mock('@shared/store/useDashboardStore');

describe('FiltersPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(useExcelData).mockReturnValue({
      data: {
        data: [
          {
            link: 'https://example.com',
            views: 1000,
            si: 500,
            er: 0.05,
            project: 'Test Project',
            period: '14.07 - 20.07',
          },
        ],
        projects: ['Test Project'],
      },
      isLoading: false,
      isError: false,
      error: null,
      isFetching: false,
      isPending: false,
      isSuccess: true,
      isFetched: true,
      refetch: vi.fn(),
      status: 'success',
      isLoadingError: false,
      isRefetchError: false,
      isPlaceholderData: false,
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      isFetchedAfterMount: true,
      isPreviousData: false,
      isStale: false,
      fetchStatus: 'idle',
    } as unknown as UseQueryResult<ExcelData, Error>);
    
    vi.mocked(useDashboardStore).mockReturnValue({
      selectedProject: '',
      selectedPeriod: '',
      setSelectedProject: vi.fn(),
      setSelectedPeriod: vi.fn(),
      resetFilters: vi.fn(),
    });
  });

  it('renders filter button', () => {
    render(<FiltersPanel />);
    const filterButton = screen.getByRole('button');
    expect(filterButton).toBeInTheDocument();
  });

  it('shows filter options when button is clicked', () => {
    render(<FiltersPanel />);
    const filterButton = screen.getByRole('button');
    fireEvent.click(filterButton);
    
    expect(screen.getByText('Фильтры')).toBeInTheDocument();
    expect(screen.getByText('Проект')).toBeInTheDocument();
    expect(screen.getByText('Период')).toBeInTheDocument();
    expect(screen.getByText('Сбросить фильтры')).toBeInTheDocument();
  });
});