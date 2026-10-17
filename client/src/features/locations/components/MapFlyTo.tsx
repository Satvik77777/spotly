import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { Location } from '../types';

interface MapFlyToProps {
  selectedLocation: Location | null;
}

export function MapFlyTo({ selectedLocation }: MapFlyToProps) {
  const map = useMap();

  useEffect(() => {
    if (selectedLocation) {
      map.flyTo(
        [selectedLocation.latitude, selectedLocation.longitude],
        Math.max(map.getZoom(), 15),
        {
          duration: 1.2,
          easeLinearity: 0.25,
        }
      );
    }
  }, [selectedLocation, map]);

  return null;
}
