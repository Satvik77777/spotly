import { Search, X, SlidersHorizontal, MapPinOff, RefreshCw } from 'lucide-react';
import { Location, LocationCategory, LOCATION_CATEGORIES } from '../types';
import { LocationCard } from './LocationCard';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Button } from '../../../components/ui/Button';
import { cn } from '../../../lib/utils';

interface LocationSidebarProps {
  locations: Location[];
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  refetch: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory: LocationCategory | 'all';
  onCategoryChange: (category: LocationCategory | 'all') => void;
  selectedLocation: Location | null;
  onSelectLocation: (location: Location) => void;
  onEditLocation: (location: Location) => void;
  onDeleteLocation: (location: Location) => void;
  onAddNew: () => void;
}

export function LocationSidebar({
  locations,
  isLoading,
  isError,
  refetch,
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedLocation,
  onSelectLocation,
  onEditLocation,
  onDeleteLocation,
  onAddNew,
}: LocationSidebarProps) {
  const hasFilters = Boolean(search.trim() || selectedCategory !== 'all');

  return (
    <aside className="flex flex-col h-full bg-white border-r border-slate-200/80 w-full sm:w-[380px] lg:w-[420px] shrink-0 z-20 shadow-sm">
      {/* Top Filter and Search Controls */}
      <div className="p-4 border-b border-slate-100 space-y-3 bg-white">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search places by name..."
            aria-label="Search places by name"
            className="w-full pl-9 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              aria-label="Clear search input"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs" role="group" aria-label="Filter locations by category">
          <button
            onClick={() => onCategoryChange('all')}
            aria-pressed={selectedCategory === 'all'}
            className={cn(
              'px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors border',
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            )}
          >
            All
          </button>
          {LOCATION_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              aria-pressed={selectedCategory === cat}
              className={cn(
                'px-3 py-1.5 rounded-lg font-medium whitespace-nowrap capitalize transition-colors border',
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Meta Bar: Result Count & Clear */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1" aria-live="polite">
          <span>
            {isLoading ? (
              'Searching locations...'
            ) : (
              <>
                <strong className="font-semibold text-slate-800">
                  {locations.length}
                </strong>{' '}
                {locations.length === 1 ? 'place' : 'places'} found
              </>
            )}
          </span>
          {hasFilters && (
            <button
              onClick={() => {
                onSearchChange('');
                onCategoryChange('all');
              }}
              className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline text-xs"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Main Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Loading State: Skeletons */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-xs"
              >
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-14 rounded-full" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-rose-50/50 border border-rose-200/80 my-4">
            <div className="p-3 rounded-full bg-rose-100 text-rose-600 mb-3">
              <RefreshCw className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">
              Failed to load locations
            </h4>
            <p className="mt-1 text-xs text-slate-500 max-w-[240px]">
              Could not connect to the Express server or MongoDB database.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              className="mt-4 gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </Button>
          </div>
        )}

        {/* Empty Search/Filter Results State */}
        {!isLoading && !isError && locations.length === 0 && hasFilters && (
          <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 my-4">
            <div className="p-3 rounded-full bg-slate-100 text-slate-400 mb-3">
              <MapPinOff className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">
              No matching locations
            </h4>
            <p className="mt-1 text-xs text-slate-500 max-w-[220px]">
              We couldn't find any places matching your current search or category filter.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onSearchChange('');
                onCategoryChange('all');
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Completely Empty Database State */}
        {!isLoading && !isError && locations.length === 0 && !hasFilters && (
          <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 my-4">
            <div className="p-3 rounded-full bg-indigo-50 text-indigo-600 mb-3">
              <SlidersHorizontal className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">
              No locations added yet
            </h4>
            <p className="mt-1 text-xs text-slate-500 max-w-[220px]">
              Start exploring by adding your first place or seeding the demo dataset.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={onAddNew}
              className="mt-4"
            >
              Add First Location
            </Button>
          </div>
        )}

        {/* Populated Cards List */}
        {!isLoading &&
          !isError &&
          locations.map((loc) => (
            <LocationCard
              key={loc._id || loc.id}
              location={loc}
              isSelected={
                selectedLocation?._id === loc._id || selectedLocation?.id === loc.id
              }
              onSelect={onSelectLocation}
              onEdit={onEditLocation}
              onDelete={onDeleteLocation}
            />
          ))}
      </div>
    </aside>
  );
}
