import { z } from 'zod';
import mongoose from 'mongoose';

export const LOCATION_CATEGORIES = ['cafe', 'park', 'landmark', 'store', 'service'] as const;
export type LocationCategory = (typeof LOCATION_CATEGORIES)[number];

// Parameter schema validating 24-character hexadecimal ObjectId
export const locationIdParamSchema = z.object({
  id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid location ID format',
  }),
});

// Query parameters schema for GET /api/locations
export const queryLocationsSchema = z.object({
  search: z.string().trim().max(100).optional(),
  category: z.enum(LOCATION_CATEGORIES).optional(),
});

// Schema for POST /api/locations
export const createLocationSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(1, 'Name cannot be empty')
    .max(120, 'Name cannot exceed 120 characters'),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(1, 'Description cannot be empty')
    .max(1000, 'Description cannot exceed 1000 characters'),
  category: z.enum(LOCATION_CATEGORIES, {
    errorMap: () => ({
      message: `Category must be one of: ${LOCATION_CATEGORIES.join(', ')}`,
    }),
  }),
  latitude: z
    .number({ required_error: 'Latitude is required', invalid_type_error: 'Latitude must be a number' })
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: z
    .number({ required_error: 'Longitude is required', invalid_type_error: 'Longitude must be a number' })
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
});

// Schema for PATCH /api/locations/:id
export const updateLocationSchema = createLocationSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
export type QueryLocationsInput = z.infer<typeof queryLocationsSchema>;
