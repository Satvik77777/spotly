import { Router } from 'express';
import {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
} from './location.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  createLocationSchema,
  updateLocationSchema,
  queryLocationsSchema,
  locationIdParamSchema,
} from './location.schema.js';

export const locationRouter = Router();

locationRouter.get(
  '/',
  validateRequest({ query: queryLocationsSchema }),
  getLocations
);

locationRouter.get(
  '/:id',
  validateRequest({ params: locationIdParamSchema }),
  getLocationById
);

locationRouter.post(
  '/',
  validateRequest({ body: createLocationSchema }),
  createLocation
);

locationRouter.patch(
  '/:id',
  validateRequest({
    params: locationIdParamSchema,
    body: updateLocationSchema,
  }),
  updateLocation
);

locationRouter.delete(
  '/:id',
  validateRequest({ params: locationIdParamSchema }),
  deleteLocation
);
