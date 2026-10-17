import { Schema, model, Document } from 'mongoose';
import { LOCATION_CATEGORIES, LocationCategory } from './location.schema.js';

export interface ILocation extends Document {
  name: string;
  description: string;
  category: LocationCategory;
  latitude: number;
  longitude: number;
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema<ILocation>(
  {
    name: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
      maxlength: [120, 'Location name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Location description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: LOCATION_CATEGORIES,
        message: '{VALUE} is not a valid category',
      },
      index: true,
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_, ret) => {
        ret.id = ret._id;
        return ret;
      },
    },
  }
);

export const Location = model<ILocation>('Location', locationSchema);
