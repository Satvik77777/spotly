import axios from 'axios';
import {
  Location,
  CreateLocationDto,
  UpdateLocationDto,
  ApiResponse,
  LocationFilters,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const locationsApi = {
  async getAll(filters?: LocationFilters): Promise<Location[]> {
    const params = new URLSearchParams();
    if (filters?.search && filters.search.trim()) {
      params.append('search', filters.search.trim());
    }
    if (filters?.category && filters.category !== 'all') {
      params.append('category', filters.category);
    }

    const response = await apiClient.get<ApiResponse<Location[]>>('/locations', {
      params,
    });
    return response.data.data;
  },

  async getById(id: string): Promise<Location> {
    const response = await apiClient.get<ApiResponse<Location>>(`/locations/${id}`);
    return response.data.data;
  },

  async create(data: CreateLocationDto): Promise<Location> {
    const response = await apiClient.post<ApiResponse<Location>>('/locations', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateLocationDto): Promise<Location> {
    const response = await apiClient.patch<ApiResponse<Location>>(`/locations/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<{ id: string; message: string }> {
    const response = await apiClient.delete<ApiResponse<{ id: string; message: string }>>(
      `/locations/${id}`
    );
    return response.data.data;
  },

  async checkHealth(): Promise<{ status: string; database: string }> {
    const response = await apiClient.get<ApiResponse<{ status: string; database: string }>>(
      '/health'
    );
    return response.data.data;
  },
};
