import { MapPin, Navigation, Pencil, Trash2 } from 'lucide-react';
import { Location } from '../types';
import { CategoryBadge } from './CategoryBadge';
import { cn, formatCoordinates } from '../../../lib/utils';

interface LocationCardProps {
  location: Location;
  isSelected: boolean;
  onSelect: (location: Location) => void;
  onEdit: (location: Location) => void;
  onDelete: (location: Location) => void;
}

export function LocationCard({
  location,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: LocationCardProps) {
  return (
    <div
      onClick={() => onSelect(location)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(location);
        }
      }}
      className={cn(
        'group relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 text-left cursor-pointer select-none',
        'bg-white hover:border-slate-300 hover:shadow-md',
        isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20 shadow-md'
          : 'border-slate-200 shadow-xs'
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <h4
            className={cn(
              'font-semibold text-sm leading-snug line-clamp-1 transition-colors',
              isSelected ? 'text-indigo-950' : 'text-slate-900 group-hover:text-indigo-600'
            )}
          >
            {location.name}
          </h4>
          <CategoryBadge category={location.category} />
        </div>

        <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {location.description}
        </p>
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
          <span>{formatCoordinates(location.latitude, location.longitude)}</span>
        </div>

        <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            title="Focus on map"
            aria-label={`Focus ${location.name} on map`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(location);
            }}
            className="p-1 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
          >
            <Navigation className="h-3.5 w-3.5" />
          </button>
          <button
            title="Edit location"
            aria-label={`Edit ${location.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(location);
            }}
            className="p-1 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            title="Delete location"
            aria-label={`Delete ${location.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(location);
            }}
            className="p-1 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
