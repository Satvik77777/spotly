import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LocationCard } from '../features/locations/components/LocationCard';
import { LocationSidebar } from '../features/locations/components/LocationSidebar';
import { locationFormSchema } from '../features/locations/schemas/locationFormSchema';
import { Location } from '../features/locations/types';

const MOCK_LOCATION: Location = {
  _id: '670f5e13a912a53d9e03f1b4',
  name: 'Sukhna Lake Promenade',
  description: 'Scenic man-made lake at the foothills of Shivalik.',
  category: 'landmark',
  latitude: 30.7421,
  longitude: 76.8188,
  createdAt: '2026-10-15T09:00:00.000Z',
  updatedAt: '2026-10-15T09:00:00.000Z',
};

describe('Frontend Location Feature Tests', () => {
  it('renders LocationCard with correct information and category badge', () => {
    const onSelect = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <LocationCard
        location={MOCK_LOCATION}
        isSelected={false}
        onSelect={onSelect}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('Sukhna Lake Promenade')).toBeInTheDocument();
    expect(screen.getByText('Landmark')).toBeInTheDocument();
    expect(screen.getByText(/Scenic man-made lake/i)).toBeInTheDocument();
    // Test formatted coordinates
    expect(screen.getByText(/30.7421° N, 76.8188° E/i)).toBeInTheDocument();
  });

  it('triggers onSelect when LocationCard is clicked', () => {
    const onSelect = vi.fn();
    render(
      <LocationCard
        location={MOCK_LOCATION}
        isSelected={false}
        onSelect={onSelect}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Sukhna Lake Promenade'));
    expect(onSelect).toHaveBeenCalledWith(MOCK_LOCATION);
  });

  it('renders empty filter state when no search results match', () => {
    render(
      <LocationSidebar
        locations={[]}
        isLoading={false}
        isError={false}
        refetch={vi.fn()}
        search="Unknown Place"
        onSearchChange={vi.fn()}
        selectedCategory="all"
        onCategoryChange={vi.fn()}
        selectedLocation={null}
        onSelectLocation={vi.fn()}
        onEditLocation={vi.fn()}
        onDeleteLocation={vi.fn()}
        onAddNew={vi.fn()}
      />
    );

    expect(screen.getByText(/No matching locations/i)).toBeInTheDocument();
    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
  });

  describe('Location Zod Form Validation', () => {
    it('validates correct form values successfully', () => {
      const validData = {
        name: 'Sector 17 Plaza',
        description: 'Commercial heart of the city',
        category: 'store',
        latitude: 30.7415,
        longitude: 76.7849,
      };

      const result = locationFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects empty name and out-of-range coordinates', () => {
      const invalidData = {
        name: '',
        description: 'Valid description',
        category: 'cafe',
        latitude: 105.0, // Invalid: exceeds 90
        longitude: 76.78,
      };

      const result = locationFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.name).toBeDefined();
        expect(errors.latitude).toBeDefined();
      }
    });

    it('rejects invalid category', () => {
      const invalidCategory = {
        name: 'Fun Place',
        description: 'Valid description',
        category: 'cinema', // not in allowed category enum
        latitude: 30.7,
        longitude: 76.7,
      };

      const result = locationFormSchema.safeParse(invalidCategory);
      expect(result.success).toBe(false);
    });
  });
});
