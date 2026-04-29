import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should return initial value', () => {
    const { result } = renderHook(() => useDebounce('initial'));
    expect(result.current).toBe('initial');
  });

  it('should debounce with default delay (300ms)', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated' });

    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(299);
    });

    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe('updated');
  });

  it('should debounce with custom delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 500 });

    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(499);
    });

    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe('updated');
  });

  it('should cancel previous timeout if value changes again', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated1' });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe('initial');

    rerender({ value: 'updated2' });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe('updated2');
  });
});
