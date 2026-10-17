import { z } from 'zod';
import { LOCATION_CATEGORIES } from '../types';

export const locationFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Location name is required')
    .max(120, 'Name cannot exceed 120 characters'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(1000, 'Description cannot exceed 1000 characters'),
  category: z.enum(LOCATION_CATEGORIES, {
    errorMap: () => ({ message: 'Please select a valid category' }),
  }),
  latitude: z
    .number({
      required_error: 'Latitude is required',
      invalid_type_error: 'Latitude must be a valid number',
    })
    .min(-90, 'Latitude must be at least -90°')
    .max(90, 'Latitude must be at most 90°'),
  longitude: z
    .number({
      required_error: 'Longitude is required',
      invalid_type_error: 'Longitude must be a valid number',
    })
    .min(-180, 'Longitude must be at least -180°')
    .max(180, 'Longitude must be at most 180°'),
});

export type LocationFormData = z.infer<typeof locationFormSchema>;
