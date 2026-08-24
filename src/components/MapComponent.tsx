"use client";
import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix Leaflet's default icon path issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle live routing and search
function RoutingIntegration({ jobs }: { jobs: any[] }) {
  const map = useMap();
  const [currentLocation, setCurrentLocation] = useState<L.LatLng | null>(null);
  const routingControlRef = useRef<any>(null);

  useEffect(() => {
    // 1. Get Live Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCurrentLocation(L.latLng(pos.coords.latitude, pos.coords.longitude)),
        (err) => console.warn("Location access denied or error:", err),
        { enableHighAccuracy: true }
      );
    }

    // 2. Add GeoSearch Control
    const provider = new OpenStreetMapProvider();
    const searchControl = new (GeoSearchControl as any)({
      provider: provider,
      style: 'bar',
      showMarker: true,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
      searchLabel: 'Enter destination address...'
    });
    map.addControl(searchControl);

    // 3. Initialize Routing Machine (hidden initially)
    routingControlRef.current = (L.Routing as any).control({
      waypoints: [],
      routeWhileDragging: true,
      showAlternatives: true,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{ color: '#3b82f6', weight: 6 }]
      },
      createMarker: function() { return null; } // We handle our own markers if needed
    }).addTo(map);

    // 4. Listen for search results to trigger routing
    map.on('geosearch/showlocation', (result: any) => {
      const dest = L.latLng(result.location.y, result.location.x);
      if (currentLocation) {
        routingControlRef.current.setWaypoints([currentLocation, dest]);
      } else {
        // Fallback to routing from map center if no GPS
        routingControlRef.current.setWaypoints([map.getCenter(), dest]);
      }
    });

    return () => {
      map.removeControl(searchControl);
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, currentLocation]);

  // Initial bounds fitting for jobs
  useEffect(() => {
    if (jobs.length > 0 && !routingControlRef.current?.getWaypoints()?.filter((w: any) => w.latLng).length) {
      const bounds = L.latLngBounds(jobs.map(j => [j.lat, j.lng]));
      if (currentLocation) bounds.extend(currentLocation);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [jobs, map, currentLocation]);

  return (
    <>
      {currentLocation && (
        <Marker position={currentLocation}>
          <Popup><strong>Your Current Location</strong></Popup>
        </Marker>
      )}
    </>
  );
}

export default function MapComponent({ jobs = [] }: { jobs?: any[] }) {
  const defaultCenter: [number, number] = [33.4484, -112.0740];

  return (
    <div style={{ height: '100%', width: '100%', zIndex: 0 }}>
      <MapContainer 
        center={defaultCenter} 
        zoom={11} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <RoutingIntegration jobs={jobs} />

        {jobs.map((job, idx) => (
          <Marker key={job.id || idx} position={[job.lat, job.lng]}>
            <Popup>
              <strong>{job.client || 'Unknown Client'}</strong><br />
              {job.service || job.title || 'Job Task'}<br />
              {job.location}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
