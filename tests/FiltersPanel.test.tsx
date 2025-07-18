import { render, screen, fireEvent } from '@testing-library/react';
import FiltersPanel from './FiltersPanel';
import { useDashboardStore } from '../../../shared/store/useDashboardStore';
import { useExcelData } from '../hooks/useExcelData';
import { vi } from 'vitest';

vi.mock('../../../shared/store/useDashboardStore', () => ({
  useDashboardStore: vi.fn(),
}));
vi.mock('../hooks/useExcelData', () => ({
  useExcelData: vi.fn(),
}));
vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));

describe('FiltersPanel', () => {
  beforeEach(() => {
    vi.mocked(useDashboardStore).mockReturnValue({
      selectedProject: '',
      selectedPeriod: '',
      setSelectedProject: vi.fn(),
      setSelectedPeriod: vi.fn(),
      resetFilters: vi.fn(),
    });
    vi.mocked(useExcelData).mockReturnValue({
      data: {
        data: [
          { link: 'a', views: 100, si: 50, er: 0.05, project: 'P1', period: '2023-01' },
        ],
        projects: ['P1'],
      },
    });
  });

  it('renders filter panel', () => {
    render(<FiltersPanel />);
    fireEvent.click(screen.getByLabelText('Фильтры'));
    expect(screen.getByText('Фильтры')).toBeInTheDocument();
    expect(screen.getByText('Все спецпроекты')).toBeInTheDocument();
  });

  it('exports CSV on button click', () => {
    const saveAs = vi.spyOn(require('file-saver'), 'saveAs');
    render(<FiltersPanel />);
    fireEvent.click(screen.getByLabelText('Фильтры'));
    fireEvent.click(screen.getByText('Экспорт в CSV'));
    expect(saveAs).toHaveBeenCalled();
    expect(screen.getByText('Файл успешно экспортирован!')).toBeInTheDocument();
  });
});