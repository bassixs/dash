import { renderHook } from '@testing-library/react';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useExcelData } from '@features/dashboard/hooks/useExcelData';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectRecordInterface } from '@core/models/ProjectRecord';

// Мокаем useQuery
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

describe('useExcelData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches excel data successfully', async () => {
    const mockData = {
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
    };

    vi.mocked(useQuery).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      isFetching: false,
      fetchStatus: 'idle',
      status: 'success',
      refetch: vi.fn(),
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      isFetched: true,
      isFetchedAfterMount: true,
      isPlaceholderData: false,
      isPreviousData: false,
      isStale: false,
      errorUpdateCount: 0,
      isInitialLoading: false,
      isPaused: false,
      isRefetching: false,
      remove: vi.fn(),
      isEnabled: true,
      promise: Promise.resolve(mockData),
    } as unknown as UseQueryResult<{ data: ProjectRecordInterface[]; projects: string[] }, unknown>);

    const { result } = renderHook(() => useExcelData());
    expect(result.current.data).toEqual(mockData);
    expect(useQuery).toHaveBeenCalledWith({
      queryKey: ['excelData'],
      queryFn: expect.any(Function),
      staleTime: 1000 * 60 * 60 * 12,
      retry: 2,
    });
  });

  it('handles error state', async () => {
    const mockError = new Error('Failed to fetch');

    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: mockError,
      isSuccess: false,
      isPending: false,
      isLoadingError: true,
      isRefetchError: false,
      isFetching: false,
      fetchStatus: 'idle',
      status: 'error',
      refetch: vi.fn(),
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      failureCount: 1,
      failureReason: mockError,
      isFetched: true,
      isFetchedAfterMount: true,
      isPlaceholderData: false,
      isPreviousData: false,
      isStale: false,
      errorUpdateCount: 1,
      isInitialLoading: false,
      isPaused: false,
      isRefetching: false,
      remove: vi.fn(),
      isEnabled: false,
      promise: Promise.reject(mockError),
    } as unknown as UseQueryResult<{ data: ProjectRecordInterface[]; projects: string[] }, Error>);

    const { result } = renderHook(() => useExcelData());
    expect(result.current.error).toEqual(mockError);
  });
});