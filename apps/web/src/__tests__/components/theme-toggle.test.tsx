import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { ThemeToggle } from '../../components/theme-toggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Reset class list before each test
    document.documentElement.className = '';
  });

  it('renders the toggle button', () => {
    render(<ThemeToggle />);
    expect(screen.getByText('Toggle theme')).toBeInTheDocument();
  });

  it('toggles dark mode class on click', () => {
    render(<ThemeToggle />);
    const button = screen.getByText('Toggle theme');

    // Initial state: not dark
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Click to toggle on
    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Click to toggle off
    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
