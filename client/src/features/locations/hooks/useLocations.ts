import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { locationsApi } from '../api/locationsApi';
import {
  CreateLocationDto,
  UpdateLocationDto,
  LocationFilters,
  ApiResponse,
} from '../types';

export const LOCATIONS_QUERY_KEY = ['locations'] as const;

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.error?.message || error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export function useLocations(filters?: LocationFilters) {
  return useQuery({
    queryKey: [...LOCATIONS_QUERY_KEY, filters?.search ?? '', filters?.category ?? 'all'],
    queryFn: () => locationsApi.getAll(filters),
  });
}

export function useCreateLocation(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLocationDto) => locationsApi.create(data),
    onSuccess: (newLocation) => {
      queryClient.invalidateQueries({ queryKey: LOCATIONS_QUERY_KEY });
      toast.success(`Created "${newLocation.name}" successfully!`);
      onSuccessCallback?.();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to create location'));
    },
  });
}

export function useUpdateLocation(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLocationDto }) =>
      locationsApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: LOCATIONS_QUERY_KEY });
      toast.success(`Updated "${updated.name}" successfully!`);
      onSuccessCallback?.();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to update location'));
    },
  });
}

export function useDeleteLocation(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => locationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATIONS_QUERY_KEY });
      toast.success('Location deleted successfully');
      onSuccessCallback?.();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to delete location'));
    },
  });
}
