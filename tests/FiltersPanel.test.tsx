import { render, screen, fireEvent } from '@testing-library/react';
import FiltersPanel from '@features/dashboard/components/FiltersPanel';
import { useDashboardStore } from '@shared/store/useDashboardStore';
import { useExcelData } from '@features/dashboard/hooks/useExcelData';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveAs } from 'file-saver';
import { UseQueryResult } from '@tanstack/react-query';
import { ProjectRecordInterface } from '@core/models/ProjectRecord';

interface ExcelData {
  data: ProjectRecordInterface[];
  projects: string[];
}

vi.mock('file-saver');

describe('FiltersPanel', () => {
  beforeEach(() => {
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

  it('renders filter panel', () => {
    render(<FiltersPanel />);
    expect(screen.getByText('Фильтры')).toBeInTheDocument();
    expect(screen.getByText('Все спецпроекты')).toBeInTheDocument();
  });

  it('exports CSV on button click', () => {
    render(<FiltersPanel />);
    const exportButton = screen.getByText('Экспорт в CSV');
    fireEvent.click(exportButton);
    expect(saveAs).toHaveBeenCalled();
    expect(screen.getByText('Файл успешно экспортирован!')).toBeInTheDocument();
  });
});