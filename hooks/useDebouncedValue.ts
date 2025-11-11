import { Signal, useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

/**
 * Returns a debounced version of the input signal value.
 * The debounced value will only update after the specified delay
 * has passed without the input value changing.
 */
export function useDebouncedValue<T>(
  value: Signal<T>,
  delay: number = 300,
): Signal<T> {
  const debouncedValue = useSignal<T>(value.value);

  useEffect(() => {
    const handler = setTimeout(() => {
      debouncedValue.value = value.value;
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value.value, delay]);

  return debouncedValue;
}
