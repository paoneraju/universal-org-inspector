/**
 * Typed debounce for search and other inputs
 */
export function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number): (...args: A) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: A) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}
