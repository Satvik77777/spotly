export const LOCATION_CATEGORIES = ['cafe', 'park', 'landmark', 'store', 'service'] as const;
export type LocationCategory = (typeof LOCATION_CATEGORIES)[number];

export interface Location {
  _id: string;
  id?: string;
  name: string;
  description: string;
  category: LocationCategory;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

export interface LocationFilters {
  search?: string;
  category?: LocationCategory | 'all';
}

export interface CreateLocationDto {
  name: string;
  description: string;
  category: LocationCategory;
  latitude: number;
  longitude: number;
}

export type UpdateLocationDto = Partial<CreateLocationDto>;

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
    code: string;
    details?: Array<{ field?: string; message: string }>;
  };
}
