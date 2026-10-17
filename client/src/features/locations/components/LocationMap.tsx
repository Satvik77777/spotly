import { useMemo, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import { Location } from '../types';
import { MapFlyTo } from './MapFlyTo';
import { CATEGORY_CONFIG } from './CategoryBadge';
import { MapPin, Pencil, Trash2 } from 'lucide-react';
import { formatCoordinates } from '../../../lib/utils';

interface LocationMapProps {
  locations: Location[];
  selectedLocation: Location | null;
  onSelectLocation: (location: Location) => void;
  onEditLocation: (location: Location) => void;
  onDeleteLocation: (location: Location) => void;
  isAddOnMapActive: boolean;
  onMapClickCoordinates: (coords: { lat: number; lng: number }) => void;
}

// Map Click Listener component for "Add on Map" mode
function MapEventsHandler({
  isAddOnMapActive,
  onMapClick,
}: {
  isAddOnMapActive: boolean;
  onMapClick: (coords: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(e) {
      if (isAddOnMapActive) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });

  return null;
}

// Map resize listener to prevent grey tile artifacts on window resize or tab switch
function MapResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [map]);

  return null;
}

// Helper to create category-colored HTML DivIcons with SVG pins
function createMarkerIcon(category: Location['category'], isSelected: boolean) {
  const config = CATEGORY_CONFIG[category] || {
    markerColor: '#4F46E5',
  };

  const color = config.markerColor;
  const size = isSelected ? 36 : 28;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="custom-marker-pin ${isSelected ? 'selected' : ''}" style="width: ${size}px; height: ${size}px; background-color: ${color}; border: 2.5px solid #FFFFFF;">
        <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? 18 : 14}" height="${isSelected ? 18 : 14}" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="10" r="3"/>
          <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
        </svg>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
  });
}

export function LocationMap({
  locations,
  selectedLocation,
  onSelectLocation,
  onEditLocation,
  onDeleteLocation,
  isAddOnMapActive,
  onMapClickCoordinates,
}: LocationMapProps) {
  // Memoize marker icons for performance
  const markerIcons = useMemo(() => {
    return locations.map((loc) => {
      const isSelected = selectedLocation?._id === loc._id || selectedLocation?.id === loc.id;
      return {
        id: loc._id || loc.id,
        icon: createMarkerIcon(loc.category, isSelected),
      };
    });
  }, [locations, selectedLocation]);

  return (
    <div
      className={`relative w-full h-full ${
        isAddOnMapActive ? 'cursor-crosshair' : ''
      }`}
    >
      {/* Banner indicator when "Add on Map" mode is engaged */}
      {isAddOnMapActive && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-xs font-medium text-white shadow-lg backdrop-blur-sm border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <MapPin className="h-4 w-4 text-emerald-400 animate-bounce" />
          <span>Click anywhere on the map to set location coordinates</span>
        </div>
      )}

      <MapContainer
        center={[30.7333, 76.7794]} // Chandigarh default
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapFlyTo selectedLocation={selectedLocation} />

        <MapResizeHandler />

        <MapEventsHandler
          isAddOnMapActive={isAddOnMapActive}
          onMapClick={onMapClickCoordinates}
        />

        {locations.map((loc, idx) => {
          const iconObj = markerIcons[idx];

          return (
            <Marker
              key={loc._id || loc.id || idx}
              position={[loc.latitude, loc.longitude]}
              icon={iconObj?.icon}
              eventHandlers={{
                click: (e) => {
                  // Prevent map click handler from triggering if in add mode
                  L.DomEvent.stopPropagation(e);
                  onSelectLocation(loc);
                },
              }}
            >
              <Popup closeButton={false}>
                <div className="p-3 max-w-[240px]">
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-semibold text-xs text-slate-900 leading-snug line-clamp-1">
                      {loc.name}
                    </h5>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                      {loc.category}
                    </span>
                  </div>

                  <p className="mt-1 text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {loc.description}
                  </p>

                  <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span>{formatCoordinates(loc.latitude, loc.longitude)}</span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEditLocation(loc)}
                      title="Edit"
                      className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => onDeleteLocation(loc)}
                      title="Delete"
                      className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
