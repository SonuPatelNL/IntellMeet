import { render, screen } from '@testing-library/react';
import { Button } from './Button';
import { expect, test, describe } from 'vitest';

describe('Button Component', () => {
  test('renders children correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  test('displays loading spinner when loading prop is true', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button').querySelector('.animate-spin')).toBeInTheDocument();
  });
});
