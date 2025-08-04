import React from 'react';
import { render } from '@testing-library/react';
import Chart from '@features/dashboard/components/Chart';
import { describe, it, expect } from 'vitest';
import { ChartData } from 'chart.js';

describe('Chart', () => {
  it('renders bar chart correctly', () => {
    const data: ChartData<'bar'> = {
      labels: ['Project 1'],
      datasets: [{ label: 'Views', data: [100], backgroundColor: ['#ff0000'] }],
    };
    const { container } = render(<Chart type="bar" data={data} />);
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('renders line chart correctly', () => {
    const data: ChartData<'line'> = {
      labels: ['Period 1'],
      datasets: [{ label: 'ER', data: [5], borderColor: '#f97316', backgroundColor: '#f97316' }],
    };
    const { container } = render(<Chart type="line" data={data} />);
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });
});