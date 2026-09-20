"use client";

import { useEffect, useState, useRef } from 'react';
import {
  MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Tooltip
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Navigation, MapPin, Truck, Layers, Search, Compass,
  Maximize2, Clock, ShieldCheck, CheckCircle2, ChevronRight, X, Phone
} from 'lucide-react';

// Fix Leaflet's default icon path issues in Next.js / React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Google Maps-like SVG Icons for Facilities & Cleaner Vans
const createFacilityIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-facility-pin',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="background-color: ${color}; color: white; padding: 4px 8px; border-radius: 9999px; font-weight: 700; font-size: 11px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 2px solid white; display: flex; align-items: center; gap: 4px; white-space: nowrap;">
          <span>🏢</span> ${label}
        </div>
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid ${color};"></div>
      </div>
    `,
    iconSize: [120, 42],
    iconAnchor: [60, 42],
    popupAnchor: [0, -42]
  });
};

const createFleetIcon = (status: 'cleaning' | 'driving' | 'idle', name: string) => {
  const color = status === 'cleaning' ? '#10b981' : status === 'driving' ? '#3b82f6' : '#f59e0b';
  return L.divIcon({
    className: 'custom-fleet-pin',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="background-color: #0f172a; color: white; padding: 4px 8px; border-radius: 8px; font-weight: 700; font-size: 10px; box-shadow: 0 4px 14px rgba(0,0,0,0.4); border: 2px solid ${color}; display: flex; align-items: center; gap: 4px; white-space: nowrap;">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 9999px; background-color: ${color};"></span>
          <span>🚐 ${name}</span>
        </div>
        <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid #0f172a;"></div>
      </div>
    `,
    iconSize: [110, 36],
    iconAnchor: [55, 36],
    popupAnchor: [0, -36]
  });
};

// Real Commercial Facilities Data (Dallas-Fort Worth Commercial Hub)
export const REAL_FACILITIES = [
  {
    id: 'fac-1',
    name: 'Apex Logistics Center',
    address: '8645 Commerce Blvd, Dallas, TX 75247',
    lat: 32.8124,
    lng: -96.8710,
    sqft: '85,000 sq ft',
    tier: 'Gold Tier Clean',
    crew: 'Crew A (4 Cleaners)',
    supervisor: 'Marcus Vance',
    status: 'In Progress',
    scheduledTime: '5:00 PM - 10:00 PM',
    lastInspection: '98.5% Score'
  },
  {
    id: 'fac-2',
    name: 'St. Jude Medical Surgical Center',
    address: '1200 Healthcare Way, Dallas, TX 75235',
    lat: 32.8250,
    lng: -96.8410,
    sqft: '42,000 sq ft',
    tier: 'Platinum Bio-Sanitization',
    crew: 'Bio-Safety Team (3 Cleaners)',
    supervisor: 'Elena Rostova',
    status: 'En Route',
    scheduledTime: '6:30 PM - 11:30 PM',
    lastInspection: '100% EPA Compliant'
  },
  {
    id: 'fac-3',
    name: 'Metro Tech Tower (24 Floors)',
    address: '400 Downtown Plaza, Dallas, TX 75201',
    lat: 32.7831,
    lng: -96.7990,
    sqft: '210,000 sq ft',
    tier: 'Corporate Enterprise Daily',
    crew: 'Night Janitorial Crew (12 Cleaners)',
    supervisor: 'David Kim',
    status: 'Scheduled',
    scheduledTime: '7:00 PM - 3:00 AM',
    lastInspection: '97.8% Score'
  },
  {
    id: 'fac-4',
    name: 'Westside Distribution Center',
    address: '9100 Industrial Pkwy, Dallas, TX 75220',
    lat: 32.8540,
    lng: -96.8920,
    sqft: '140,000 sq ft',
    tier: 'Industrial Auto-Scrubber',
    crew: 'Floor Care Crew (2 Cleaners)',
    supervisor: 'Sarah Jenkins',
    status: 'Scheduled',
    scheduledTime: '8:00 PM - 12:00 AM',
    lastInspection: '96.4% Score'
  },
  {
    id: 'fac-5',
    name: 'Baylor Corporate Health Pavilion',
    address: '3200 Innovation Dr, Dallas, TX 75246',
    lat: 32.7930,
    lng: -96.7720,
    sqft: '65,000 sq ft',
    tier: 'Medical Office Clean',
    crew: 'Sanitation Squad 2 (5 Cleaners)',
    supervisor: 'Carlos Ramos',
    status: 'Completed',
    scheduledTime: '1:00 PM - 5:00 PM',
    lastInspection: '99.0% Score'
  }
];

// Active Fleet Vans
export const REAL_FLEET_VEHICLES = [
  {
    id: 'van-1',
    name: 'Van 101 - Marcus Vance',
    lat: 32.8180,
    lng: -96.8620,
    status: 'driving' as const,
    speed: '38 mph',
    battery: '94%',
    heading: 'Northbound on Stemmons Fwy'
  },
  {
    id: 'van-2',
    name: 'Van 104 - Elena Rostova',
    lat: 32.8240,
    lng: -96.8430,
    status: 'cleaning' as const,
    speed: '0 mph (Parked)',
    battery: '88%',
    heading: 'Arrived at St. Jude Medical'
  },
  {
    id: 'van-3',
    name: 'Van 108 - Night Dispatch',
    lat: 32.7880,
    lng: -96.8040,
    status: 'driving' as const,
    speed: '24 mph',
    battery: '99%',
    heading: 'Heading to Metro Tech Tower'
  }
];

// Driving Route Coordinates (HQ -> Apex Logistics -> St. Jude)
const SAMPLE_ROUTE: [number, number][] = [
  [32.7767, -96.7970], // Operations HQ
  [32.7831, -96.7990],
  [32.7930, -96.8120],
  [32.8050, -96.8350],
  [32.8124, -96.8710], // Apex Logistics
  [32.8180, -96.8620],
  [32.8250, -96.8410]  // St. Jude
];

const TURN_BY_TURN_STEPS = [
  { text: 'Start from SCOMS Dallas Operations HQ (Commerce St)', dist: '0.4 mi', time: '1 min' },
  { text: 'Merge onto I-35E North (Stemmons Freeway)', dist: '4.8 mi', time: '6 mins' },
  { text: 'Take exit 434A toward Commerce Blvd / Industrial District', dist: '0.6 mi', time: '2 mins' },
  { text: 'Arrive at Apex Logistics Center (8645 Commerce Blvd)', dist: 'Destination 1', time: 'Stop 1' },
  { text: 'Continue north via Harry Hines Blvd toward Medical District', dist: '2.4 mi', time: '4 mins' },
  { text: 'Turn right onto Healthcare Way — Arrive at St. Jude Medical', dist: '0.2 mi', time: 'Final Stop' }
];

// Helper to center and zoom map
function MapFlyController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

export default function MapComponent({ jobs = [] }: { jobs?: any[] }) {
  const [mapType, setMapType] = useState<'streets' | 'satellite' | 'dark'>('streets');
  const [selectedFacility, setSelectedFacility] = useState<any | null>(REAL_FACILITIES[0]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([32.8050, -96.8350]); // Dallas-Fort Worth Cluster
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [showDirections, setShowDirections] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Map Tile Providers
  const tileUrls = {
    streets: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
  };

  const handleFacilityClick = (fac: any) => {
    setSelectedFacility(fac);
    setMapCenter([fac.lat, fac.lng]);
    setMapZoom(15);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase().trim();
    if (!query) return;

    const match = REAL_FACILITIES.find(f =>
      f.name.toLowerCase().includes(query) || f.address.toLowerCase().includes(query)
    );

    if (match) {
      handleFacilityClick(match);
    } else {
      // Default to city center
      setMapCenter([32.7767, -96.7970]);
      setMapZoom(13);
    }
  };

  const resetView = () => {
    setMapCenter([32.8050, -96.8350]);
    setMapZoom(12);
    setSelectedFacility(null);
  };

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col font-sans bg-slate-100">
      {/* Top Google Maps Style Search & Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Search Input Bar */}
        <form
          onSubmit={handleSearch}
          className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 flex items-center px-4 py-2.5 w-full max-w-md pointer-events-auto transition-all focus-within:ring-2 focus-within:ring-blue-500"
        >
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search facility name, street address, or clean zone..."
            className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="submit"
            className="ml-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition"
          >
            Find
          </button>
        </form>

        {/* Right Tools: Map Style Switcher & Center */}
        <div className="flex items-center gap-2 pointer-events-auto bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-slate-200">
          <button
            onClick={() => setMapType('streets')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              mapType === 'streets' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Streets
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              mapType === 'satellite' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> Satellite
          </button>
          <button
            onClick={() => setMapType('dark')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              mapType === 'dark' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>🌙 Night Ops</span>
          </button>
          <div className="h-4 w-px bg-slate-200 mx-1" />
          <button
            onClick={resetView}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            title="Reset Map View"
          >
            Reset View
          </button>
        </div>
      </div>

      {/* Main Map Viewport */}
      <div className="flex-1 w-full h-full relative z-0">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <MapFlyController center={mapCenter} zoom={mapZoom} />

          <TileLayer
            attribution='&copy; <a href="https://carto.com/">Carto</a> &copy; OpenStreetMap'
            url={tileUrls[mapType]}
          />

          {/* Active Navigation Driving Route Polyline */}
          <Polyline
            positions={SAMPLE_ROUTE}
            color="#2563eb"
            weight={6}
            opacity={0.85}
            dashArray={mapType === 'dark' ? '1, 10' : undefined}
          />

          {/* Real Commercial Cleaning Facilities Markers */}
          {REAL_FACILITIES.map(fac => {
            const isSelected = selectedFacility?.id === fac.id;
            const pinColor =
              fac.status === 'Completed'
                ? '#10b981'
                : fac.status === 'In Progress'
                ? '#3b82f6'
                : '#f59e0b';

            return (
              <Marker
                key={fac.id}
                position={[fac.lat, fac.lng]}
                icon={createFacilityIcon(pinColor, fac.name.split(' ')[0])}
                eventHandlers={{
                  click: () => handleFacilityClick(fac)
                }}
              >
                <Popup className="custom-facility-popup">
                  <div className="p-1 font-sans space-y-2 text-slate-900 min-w-[220px]">
                    <div className="flex items-center justify-between border-b pb-1.5">
                      <span className="font-bold text-xs text-blue-600">{fac.tier}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                        {fac.status}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm">{fac.name}</h4>
                    <p className="text-xs text-slate-500">{fac.address}</p>
                    <div className="text-xs font-medium space-y-0.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <p>📏 <strong>Area:</strong> {fac.sqft}</p>
                      <p>👥 <strong>Assigned:</strong> {fac.crew}</p>
                      <p>⏰ <strong>Shift:</strong> {fac.scheduledTime}</p>
                      <p>⭐ <strong>Inspection:</strong> {fac.lastInspection}</p>
                    </div>
                    <button
                      onClick={() => handleFacilityClick(fac)}
                      className="w-full mt-2 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs transition"
                    >
                      Inspect Route & Crew
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Real Fleet Service Vans */}
          {REAL_FLEET_VEHICLES.map(van => (
            <Marker
              key={van.id}
              position={[van.lat, van.lng]}
              icon={createFleetIcon(van.status, van.name.split('-')[1]?.trim() || van.name)}
            >
              <Popup>
                <div className="p-1 font-sans space-y-1.5 min-w-[180px]">
                  <h4 className="font-bold text-sm text-slate-900">{van.name}</h4>
                  <p className="text-xs text-slate-500">Live Telemetry: {van.heading}</p>
                  <div className="text-xs bg-slate-50 p-2 rounded border space-y-0.5">
                    <p>Speed: <strong>{van.speed}</strong></p>
                    <p>Vehicle Health: <strong>{van.battery} battery</strong></p>
                    <p>GPS Mode: <strong className="text-emerald-600">Locked / En Route</strong></p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Google Maps Style Left Drawer: Turn-by-Turn Navigation */}
      {showDirections && (
        <div className="absolute top-20 left-4 z-[999] w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[calc(100%-100px)] animate-in slide-in-from-left duration-200">
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-white" />
              <div>
                <h3 className="font-bold text-sm">Optimized Route Navigation</h3>
                <p className="text-[11px] text-blue-100">Dallas Metro Fleet · 2 Facilities Active</p>
              </div>
            </div>
            <button
              onClick={() => setShowDirections(false)}
              className="text-white/80 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Travel Time: <strong>22 mins</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Total: <strong>14.2 miles</strong></span>
            </div>
          </div>

          {/* Turn-by-turn steps list */}
          <div className="p-3 overflow-y-auto space-y-2 flex-1 text-xs">
            {TURN_BY_TURN_STEPS.map((step, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 flex items-start gap-2.5 transition"
              >
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{step.text}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{step.dist} · {step.time}</p>
                </div>
              </div>
            ))}
          </div>

          {selectedFacility && (
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs">
              <span className="font-bold text-slate-700 block mb-1">Target Facility Destination:</span>
              <p className="font-semibold text-blue-600">{selectedFacility.name}</p>
              <p className="text-slate-500 text-[11px]">{selectedFacility.address}</p>
            </div>
          )}
        </div>
      )}

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-4 left-4 right-4 z-[999] flex items-center justify-between pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-slate-200 text-xs text-slate-700 flex items-center gap-4 pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Active Clean</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>En Route</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Scheduled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>🚐 Fleet Van GPS</span>
          </div>
        </div>

        {!showDirections && (
          <button
            onClick={() => setShowDirections(true)}
            className="pointer-events-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 transition"
          >
            <Navigation className="w-4 h-4" />
            <span>Show Route Directions</span>
          </button>
        )}
      </div>
    </div>
  );
}
