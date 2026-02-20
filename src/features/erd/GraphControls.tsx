import { Checkbox } from '../../components/Checkbox';
import { Button } from '../../components/Button';
import type { ErdLayoutMode } from '../../types/erd';

export interface GraphControlsProps {
  depth: number;
  onDepthChange: (v: number) => void;
  includeStandard: boolean;
  onIncludeStandardChange: (v: boolean) => void;
  includeCustom: boolean;
  onIncludeCustomChange: (v: boolean) => void;
  layout: ErdLayoutMode;
  onLayoutChange: (v: ErdLayoutMode) => void;
  onExportPng: () => void;
  onExportSvg: () => void;
  onExportJson: () => void;
  truncated?: boolean;
}

export function GraphControls({
  depth,
  onDepthChange,
  includeStandard,
  onIncludeStandardChange,
  includeCustom,
  onIncludeCustomChange,
  layout,
  onLayoutChange,
  onExportPng,
  onExportSvg,
  onExportJson,
  truncated,
}: GraphControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 p-2 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
      <label className="flex items-center gap-2 text-sm">
        Depth:
        <select
          value={depth}
          onChange={(e) => onDepthChange(Number(e.target.value))}
          className="py-1 px-2 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-sm"
        >
          {[1, 2, 3, 4, 5].map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </label>
      <Checkbox label="Standard" checked={includeStandard} onChange={(e) => onIncludeStandardChange(e.target.checked)} />
      <Checkbox label="Custom" checked={includeCustom} onChange={(e) => onIncludeCustomChange(e.target.checked)} />
      <label className="flex items-center gap-2 text-sm">
        Layout:
        <select
          value={layout}
          onChange={(e) => onLayoutChange(e.target.value as ErdLayoutMode)}
          className="py-1 px-2 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-sm"
        >
          <option value="hierarchical">Hierarchical</option>
          <option value="radial">Radial</option>
          <option value="force">Force</option>
        </select>
      </label>
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={onExportPng}>Export PNG</Button>
        <Button size="sm" variant="secondary" onClick={onExportSvg}>Export SVG</Button>
        <Button size="sm" variant="secondary" onClick={onExportJson}>Export JSON</Button>
      </div>
      {truncated && (
        <span className="text-amber-600 dark:text-amber-400 text-sm">Graph truncated (max nodes/edges reached)</span>
      )}
    </div>
  );
}
