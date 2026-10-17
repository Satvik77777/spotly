import { useState, useTransition } from 'react';
import { Toaster } from 'sonner';
import { Header } from '../components/layout/Header';
import { LocationSidebar } from '../features/locations/components/LocationSidebar';
import { LocationMap } from '../features/locations/components/LocationMap';
import { LocationFormModal } from '../features/locations/components/LocationFormModal';
import { DeleteConfirmModal } from '../features/locations/components/DeleteConfirmModal';
import { Location, LocationCategory } from '../features/locations/types';
import { useLocations } from '../features/locations/hooks/useLocations';

export function App() {
  // Search and Category Filter State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LocationCategory | 'all'>('all');
  const [, startTransition] = useTransition();

  // Active selection and Map Mode State
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isAddOnMapActive, setIsAddOnMapActive] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'map' | 'list'>('map');

  // Modal Dialog States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [locationToEdit, setLocationToEdit] = useState<Location | null>(null);
  const [capturedCoordinates, setCapturedCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch Locations from MongoDB via TanStack Query
  const {
    data: locations = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useLocations({
    search,
    category: selectedCategory,
  });

  // Handlers
  const handleSearchChange = (val: string) => {
    startTransition(() => {
      setSearch(val);
    });
  };

  const handleOpenCreateModal = () => {
    setLocationToEdit(null);
    setCapturedCoordinates(null);
    setIsAddOnMapActive(false);
    setIsFormModalOpen(true);
  };

  const handleEditLocation = (loc: Location) => {
    setLocationToEdit(loc);
    setCapturedCoordinates(null);
    setIsFormModalOpen(true);
  };

  const handleDeleteLocation = (loc: Location) => {
    setLocationToDelete(loc);
    setIsDeleteModalOpen(true);
  };

  const handleSelectLocation = (loc: Location) => {
    setSelectedLocation(loc);
    // On mobile screens, automatically switch to map tab so the user sees the focused marker
    if (window.innerWidth < 640) {
      setActiveMobileTab('map');
    }
  };

  const handleToggleAddOnMap = () => {
    setIsAddOnMapActive((prev) => !prev);
    if (!isAddOnMapActive && window.innerWidth < 640) {
      setActiveMobileTab('map');
    }
  };

  const handleMapClickCoordinates = (coords: { lat: number; lng: number }) => {
    setCapturedCoordinates(coords);
    setLocationToEdit(null);
    setIsAddOnMapActive(false);
    setIsFormModalOpen(true);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      {/* Top Application Bar */}
      <Header
        onAddNew={handleOpenCreateModal}
        isAddOnMapActive={isAddOnMapActive}
        onToggleAddOnMap={handleToggleAddOnMap}
        activeMobileTab={activeMobileTab}
        onToggleMobileTab={setActiveMobileTab}
        totalLocations={locations.length}
      />

      {/* Main Workspace: Left Sidebar + Right Map */}
      <div className="relative flex flex-1 h-[calc(100vh-4rem)] overflow-hidden">
        {/* Left Sidebar (Desktop always visible, Mobile conditional) */}
        <div
          className={`${
            activeMobileTab === 'list' ? 'flex' : 'hidden'
          } sm:flex h-full w-full sm:w-auto shrink-0 z-20`}
        >
          <LocationSidebar
            locations={locations}
            isLoading={isLoading}
            isError={isError}
            error={error}
            refetch={refetch}
            search={search}
            onSearchChange={handleSearchChange}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedLocation={selectedLocation}
            onSelectLocation={handleSelectLocation}
            onEditLocation={handleEditLocation}
            onDeleteLocation={handleDeleteLocation}
            onAddNew={handleOpenCreateModal}
          />
        </div>

        {/* Right Map Explorer (Desktop always visible, Mobile conditional) */}
        <main
          className={`${
            activeMobileTab === 'map' ? 'block' : 'hidden'
          } sm:block flex-1 h-full w-full relative z-10 bg-slate-100`}
        >
          <LocationMap
            locations={locations}
            selectedLocation={selectedLocation}
            onSelectLocation={handleSelectLocation}
            onEditLocation={handleEditLocation}
            onDeleteLocation={handleDeleteLocation}
            isAddOnMapActive={isAddOnMapActive}
            onMapClickCoordinates={handleMapClickCoordinates}
          />
        </main>
      </div>

      {/* Create / Edit Form Modal */}
      <LocationFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setLocationToEdit(null);
          setCapturedCoordinates(null);
        }}
        locationToEdit={locationToEdit}
        initialCoordinates={capturedCoordinates}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setLocationToDelete(null);
        }}
        location={locationToDelete}
      />

      {/* Toast Notification Container */}
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
