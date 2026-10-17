import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import {
  locationFormSchema,
  LocationFormData,
} from '../schemas/locationFormSchema';
import { Location, LOCATION_CATEGORIES } from '../types';
import { useCreateLocation, useUpdateLocation } from '../hooks/useLocations';

interface LocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationToEdit?: Location | null;
  initialCoordinates?: { lat: number; lng: number } | null;
}

export function LocationFormModal({
  isOpen,
  onClose,
  locationToEdit,
  initialCoordinates,
}: LocationFormModalProps) {
  const isEditing = Boolean(locationToEdit);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'cafe',
      latitude: initialCoordinates?.lat ?? 30.7333,
      longitude: initialCoordinates?.lng ?? 76.7794,
    },
  });

  const createMutation = useCreateLocation(() => {
    reset();
    onClose();
  });

  const updateMutation = useUpdateLocation(() => {
    reset();
    onClose();
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Sync form values on modal open or when edit target / coordinates change
  useEffect(() => {
    if (isOpen) {
      if (locationToEdit) {
        reset({
          name: locationToEdit.name,
          description: locationToEdit.description,
          category: locationToEdit.category,
          latitude: locationToEdit.latitude,
          longitude: locationToEdit.longitude,
        });
      } else if (initialCoordinates) {
        reset({
          name: '',
          description: '',
          category: 'cafe',
          latitude: Number(initialCoordinates.lat.toFixed(6)),
          longitude: Number(initialCoordinates.lng.toFixed(6)),
        });
      } else {
        reset({
          name: '',
          description: '',
          category: 'cafe',
          latitude: 30.7333,
          longitude: 76.7794,
        });
      }
    }
  }, [isOpen, locationToEdit, initialCoordinates, reset]);

  const onSubmit = (data: LocationFormData) => {
    if (isEditing && locationToEdit) {
      updateMutation.mutate({
        id: locationToEdit._id || locationToEdit.id!,
        data,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Location' : 'Add New Location'}
      description={
        isEditing
          ? 'Update the details and coordinates for this location.'
          : initialCoordinates
          ? 'Coordinates captured from map click. Fill in details to save.'
          : 'Create a new pin by providing its name, category, and coordinates.'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Location Name"
          placeholder="e.g. Sukhna Lake Promenade"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Category
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {LOCATION_CATEGORIES.map((cat) => (
              <label
                key={cat}
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-slate-200 p-2 text-center hover:bg-slate-50 peer-checked:border-indigo-600 peer-checked:bg-indigo-50/50 has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50 has-[:checked]:text-indigo-900 transition-all text-xs capitalize font-medium text-slate-700"
              >
                <input
                  type="radio"
                  value={cat}
                  className="sr-only"
                  {...register('category')}
                />
                {cat}
              </label>
            ))}
          </div>
          {errors.category && (
            <p className="text-xs font-medium text-rose-600">
              {errors.category.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Latitude"
            type="number"
            step="any"
            placeholder="e.g. 30.7333"
            error={errors.latitude?.message}
            {...register('latitude', { valueAsNumber: true })}
          />
          <Input
            label="Longitude"
            type="number"
            step="any"
            placeholder="e.g. 76.7794"
            error={errors.longitude?.message}
            {...register('longitude', { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Provide a short description or highlights about this place..."
            className="flex w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors disabled:cursor-not-allowed disabled:bg-slate-50"
            {...register('description')}
          />
          {errors.description && (
            <p className="text-xs font-medium text-rose-600">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
          >
            {isEditing ? 'Save Changes' : 'Create Location'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
