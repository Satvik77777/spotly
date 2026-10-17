import { Request, Response, NextFunction } from 'express';
import { Location } from './location.model.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';
import { escapeRegex } from '../../utils/escapeRegex.js';
import { CreateLocationInput, UpdateLocationInput, QueryLocationsInput } from './location.schema.js';

export async function getLocations(
  req: Request<unknown, unknown, unknown, QueryLocationsInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { search, category } = req.query;
    const filter: Record<string, unknown> = {};

    if (search && search.trim().length > 0) {
      filter.name = { $regex: escapeRegex(search.trim()), $options: 'i' };
    }

    if (category) {
      filter.category = category;
    }

    const locations = await Location.find(filter).sort({ createdAt: -1 }).lean();
    sendSuccess(res, locations);
  } catch (error) {
    next(error);
  }
}

export async function getLocationById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const location = await Location.findById(id).lean();

    if (!location) {
      sendError(res, `Location with ID ${id} not found`, 404, 'LOCATION_NOT_FOUND');
      return;
    }

    sendSuccess(res, location);
  } catch (error) {
    next(error);
  }
}

export async function createLocation(
  req: Request<unknown, unknown, CreateLocationInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const location = await Location.create(req.body);
    sendSuccess(res, location, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateLocation(
  req: Request<{ id: string }, unknown, UpdateLocationInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const updated = await Location.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      sendError(res, `Location with ID ${id} not found`, 404, 'LOCATION_NOT_FOUND');
      return;
    }

    sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
}

export async function deleteLocation(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await Location.findByIdAndDelete(id);

    if (!deleted) {
      sendError(res, `Location with ID ${id} not found`, 404, 'LOCATION_NOT_FOUND');
      return;
    }

    sendSuccess(res, { message: 'Location deleted successfully', id });
  } catch (error) {
    next(error);
  }
}
