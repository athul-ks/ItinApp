import { fireEvent, render, screen } from '@testing-library/react';
import { format } from 'date-fns';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DateRangePicker } from '../../components/date-range-picker';

// Mock react-day-picker
vi.mock('react-day-picker', () => ({
  DayPicker: ({ onSelect }: { onSelect: (range: { from: Date; to: Date }) => void }) => (
    <div data-testid="day-picker">
      <button onClick={() => onSelect({ from: new Date('2024-01-01'), to: new Date('2024-01-05') })}>
        Select Range
      </button>
    </div>
  ),
}));

describe('DateRangePicker', () => {
  const mockSetDate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with no date selected', () => {
    render(<DateRangePicker date={undefined} setDate={mockSetDate} />);
    expect(screen.getByText('Pick a date range')).toBeInTheDocument();
  });

  it('renders correctly with a date range selected', () => {
    const from = new Date('2024-01-01');
    const to = new Date('2024-01-05');

    render(<DateRangePicker date={{ from, to }} setDate={mockSetDate} />);

    const expectedLabel = `${format(from, 'LLL dd, y')} - ${format(to, 'LLL dd, y')}`;
    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
  });

  it('opens popover when clicked', () => {
    render(<DateRangePicker date={undefined} setDate={mockSetDate} />);

    // The trigger button
    const trigger = screen.getByText('Pick a date range').closest('button');
    if (!trigger) throw new Error('Trigger button not found');

    fireEvent.click(trigger);

    expect(screen.getByTestId('day-picker')).toBeInTheDocument();
  });

  it('closes popover when clicking outside', () => {
    render(<DateRangePicker date={undefined} setDate={mockSetDate} />);

    const trigger = screen.getByText('Pick a date range').closest('button');
    if (!trigger) throw new Error('Trigger button not found');

    fireEvent.click(trigger); // Open
    expect(screen.getByTestId('day-picker')).toBeInTheDocument();

    // Click outside on document body
    fireEvent.mouseDown(document.body);

    // Should be closed
    expect(screen.queryByTestId('day-picker')).not.toBeInTheDocument();
  });

  it('closes popover when a range is selected', () => {
    render(<DateRangePicker date={undefined} setDate={mockSetDate} />);

    const trigger = screen.getByText('Pick a date range').closest('button');
    if (!trigger) throw new Error('Trigger button not found');

    fireEvent.click(trigger); // Open

    const selectButton = screen.getByText('Select Range');
    fireEvent.click(selectButton);

    expect(mockSetDate).toHaveBeenCalled();
    // The mock passes distinct dates, so logic inside handleSelect closes the modal
    expect(screen.queryByTestId('day-picker')).not.toBeInTheDocument();
  });
});
