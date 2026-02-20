import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useSObjects } from '../../hooks/useSObjects';
import { useApiVersion } from '../../hooks/useApiVersion';
import { useToast } from '../../contexts/ToastContext';
import { Input } from '../../components/Input';
import { Checkbox } from '../../components/Checkbox';
import { debounce } from '../../utils/debounce';

const RECENT_MAX = 10;
const ROW_HEIGHT = 36;

export function ObjectSidebar() {
  const { apiVersion } = useApiVersion();
  const {
    sobjects,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    includeStandard,
    setIncludeStandard,
    includeCustom,
    setIncludeCustom,
  } = useSObjects(apiVersion);
  const { addToast } = useToast();

  useEffect(() => {
    if (error) addToast(error instanceof Error ? error.message : 'Failed to load objects', 'error');
  }, [error, addToast]);

  const [inputValue, setInputValue] = useState(searchTerm);
  const navigate = useNavigate();
  const { objectApiName } = useParams<{ objectApiName?: string }>();
  const parentRef = useRef<HTMLDivElement>(null);

  const debouncedSetSearch = useMemo(() => debounce((v: string) => setSearchTerm(v), 300), [setSearchTerm]);

  useEffect(() => {
    debouncedSetSearch(inputValue);
  }, [inputValue, debouncedSetSearch]);

  const [recent, setRecent] = useState<string[]>([]);
  const addRecent = useCallback((name: string) => {
    setRecent((prev) => [name, ...prev.filter((n) => n !== name)].slice(0, RECENT_MAX));
  }, []);

  const virtualizer = useVirtualizer({
    count: sobjects.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  const handleSelect = (name: string) => {
    addRecent(name);
    navigate(`/app/object/${encodeURIComponent(name)}`);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-neutral-200 dark:border-neutral-700 shrink-0">
        <Input
          placeholder="Search objects…"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="mb-2"
        />
        <div className="flex gap-3">
          <Checkbox label="Standard" checked={includeStandard} onChange={(e) => setIncludeStandard(e.target.checked)} />
          <Checkbox label="Custom" checked={includeCustom} onChange={(e) => setIncludeCustom(e.target.checked)} />
        </div>
      </div>
      {recent.length > 0 && (
        <div className="px-2 py-1 border-b border-neutral-200 dark:border-neutral-700 shrink-0">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">Recently viewed</p>
          <div className="flex flex-wrap gap-1">
            {recent.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => handleSelect(name)}
                className="text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 truncate max-w-full"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex-1 overflow-auto min-h-0" ref={parentRef}>
        {error && (
          <div className="p-2 text-sm text-red-600 dark:text-red-400">
            {error instanceof Error ? error.message : 'Failed to load objects'}
          </div>
        )}
        {isLoading && (
          <div className="p-2 text-sm text-neutral-500 dark:text-neutral-400">Loading…</div>
        )}
        {!isLoading && !error && (
          <div
            style={{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}
            className="py-1"
          >
            {virtualizer.getVirtualItems().map((item) => {
              const obj = sobjects[item.index];
              const isSelected = obj.name === objectApiName;
              return (
                <button
                  key={obj.name}
                  type="button"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${item.size}px`,
                    transform: `translateY(${item.start}px)`,
                  }}
                  className={`text-left px-3 py-1.5 text-sm truncate block w-full ${
                    isSelected
                      ? 'bg-neutral-200 dark:bg-neutral-600 text-neutral-900 dark:text-neutral-100 font-medium'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                  }`}
                  onClick={() => handleSelect(obj.name)}
                >
                  <span className="font-mono">{obj.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
