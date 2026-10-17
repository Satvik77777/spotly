import { MapPin, Plus, Compass, MousePointerClick, Layers } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeaderProps {
  onAddNew: () => void;
  isAddOnMapActive: boolean;
  onToggleAddOnMap: () => void;
  activeMobileTab: 'map' | 'list';
  onToggleMobileTab: (tab: 'map' | 'list') => void;
  totalLocations: number;
}

export function Header({
  onAddNew,
  isAddOnMapActive,
  onToggleAddOnMap,
  activeMobileTab,
  onToggleMobileTab,
  totalLocations,
}: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shrink-0 z-30 select-none shadow-xs">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-200">
          <Compass className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-none">
              Spotly
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              <MapPin className="h-3 w-3 text-slate-400" />
              Chandigarh
            </span>
          </div>
          <p className="hidden sm:block text-xs text-slate-500 font-medium">
            Interactive Places Explorer
          </p>
        </div>
      </div>

      {/* Mobile Toggle Tabs (Visible only on < sm screens) */}
      <div className="flex sm:hidden rounded-lg bg-slate-100 p-1 border border-slate-200/60" role="tablist">
        <button
          role="tab"
          aria-selected={activeMobileTab === 'list'}
          aria-label="View locations list"
          onClick={() => onToggleMobileTab('list')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
            activeMobileTab === 'list'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>List ({totalLocations})</span>
        </button>
        <button
          role="tab"
          aria-selected={activeMobileTab === 'map'}
          aria-label="View interactive map"
          onClick={() => onToggleMobileTab('map')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
            activeMobileTab === 'map'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Compass className="h-3.5 w-3.5" />
          <span>Map</span>
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Add on Map Toggle Button */}
        <Button
          variant={isAddOnMapActive ? 'accent' : 'outline'}
          size="sm"
          onClick={onToggleAddOnMap}
          className="text-xs gap-1.5"
          title="Click on the map canvas to place a pin"
          aria-pressed={isAddOnMapActive}
        >
          <MousePointerClick className="h-3.5 w-3.5" />
          <span className="hidden md:inline">
            {isAddOnMapActive ? 'Selecting on Map...' : 'Add on Map'}
          </span>
          <span className="md:hidden">Map Pin</span>
        </Button>

        {/* Regular Add Location Modal Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={onAddNew}
          className="text-xs gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Location</span>
        </Button>
      </div>
    </header>
  );
}
