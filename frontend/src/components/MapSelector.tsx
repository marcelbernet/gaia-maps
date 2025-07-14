import React, { forwardRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface MapSelectorProps {
  onLocationSelect: (coords: [number, number]) => void;
  selectedLocation: [number, number] | null;
  children?: React.ReactNode;
}

const DEFAULT_POSITION: [number, number] = [41.35168556332073, 2.1116924285888676];

const LocationMarker: React.FC<{ onSelect: (coords: [number, number]) => void; selected: [number, number] | null }> = ({ onSelect, selected }) => {
  useMapEvents({
    click(e) {
      onSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return selected ? <Marker position={selected} /> : null;
};

const MapSelector = forwardRef<any, MapSelectorProps>(({ onLocationSelect, selectedLocation, children }, ref) => {
  return (
    <MapContainer ref={ref} center={selectedLocation || DEFAULT_POSITION} zoom={10} style={{ height: '100vh', width: '100vw' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker onSelect={onLocationSelect} selected={selectedLocation} />
      {children}
    </MapContainer>
  );
});

export default MapSelector; 