import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import MapSelector from './components/MapSelector';
import DateTimePicker from './components/DateTimePicker';
import StarOverlay from './components/StarOverlay';
import Loader from './components/Loader';
import { fetchStars, fetchStarPDF } from './api/gaiamaps';
import { StarData } from './types/star';
import IntroOverlay from './components/TypewriterHeadline.tsx';
import TutorialModal from './components/TutorialModal';

// Big Dipper data
const bigDipperData = [
  { name: 'Dubhe', designation: 'α UMa', ra: 11 + 3/60 + 43/3600, dec: 61 + 45/60 + 3/3600, phot_g_mean_mag: 1.79, bp_rp: 0.84 },
  { name: 'Merak', designation: 'β UMa', ra: 11 + 1/60 + 50/3600, dec: 56 + 22/60 + 0/3600, phot_g_mean_mag: 2.37, bp_rp: 0.38 },
  { name: 'Phecda', designation: 'γ UMa', ra: 11 + 53/60 + 0/3600, dec: 53 + 42/60 + 0/3600, phot_g_mean_mag: 2.42, bp_rp: 0.35 },
  { name: 'Megrez', designation: 'δ UMa', ra: 12 + 15/60 + 25.6/3600, dec: 57 + 1/60 + 57/3600, phot_g_mean_mag: 3.32, bp_rp: 0.22 },
  { name: 'Alioth', designation: 'ε UMa', ra: 12 + 54/60 + 0/3600, dec: 55 + 57/60 + 0/3600, phot_g_mean_mag: 1.76, bp_rp: 0.10 },
  { name: 'Mizar', designation: 'ζ UMa', ra: 13 + 23/60 + 0/3600, dec: 54 + 56/60 + 0/3600, phot_g_mean_mag: 2.23, bp_rp: 0.15 },
  { name: 'Alkaid', designation: 'η UMa', ra: 13 + 47/60 + 0/3600, dec: 49 + 19/60 + 0/3600, phot_g_mean_mag: 1.84, bp_rp: -0.03 },
];

function raDecOffsets(data: any[]) {
  // Find mean RA/Dec
  const meanRA = data.reduce((sum, s) => sum + s.ra, 0) / data.length;
  const meanDec = data.reduce((sum, s) => sum + s.dec, 0) / data.length;
  // Return offsets in degrees
  return data.map(s => ({
    ...s,
    alt_diff: (s.dec - meanDec),
    az_diff: (s.ra - meanRA) * 15 * Math.cos(meanDec * Math.PI / 180), // RA offset in deg, scaled by cos(dec)
  }));
}

const DEFAULT_POSITION = [41.35168556332073, 2.1116924285888676];

const getDeviceType = (width: number) => {
  if (width <= 800) return 'Phone';
  return 'Computer';
};

const App: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [stars, setStars] = useState<StarData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBigDipper, setShowBigDipper] = useState(true);
  const [showExplanation, setShowExplanation] = useState(true);
  const [zenithStar, setZenithStar] = useState<StarData | null>(null);
  const [zenithPopupOpen, setZenithPopupOpen] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Store the initial map center (never changes)
  const initialCenter = useRef<[number, number] | null>(DEFAULT_POSITION as [number, number]);
  const mapRef = useRef<any>(null);
  const [showConstellation, setShowConstellation] = useState(false);
  const [tutorialStep, setTutorialStep] = useState<number | null>(null);
  const [hasClickedMap, setHasClickedMap] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Animate map to globe on load
    setTimeout(() => {
      if (mapRef.current && mapRef.current.flyTo) {
        mapRef.current.flyTo([0, 0], 3, { animate: true, duration: 4 });
        setTimeout(() => setShowConstellation(true), 4000);
      }
    }, 500);
  }, []);

  useEffect(() => {
    if (stars.length > 0) setShowBigDipper(false);
  }, [stars]);

  const handleGetStars = async () => {
    if (!selectedLocation || !selectedDate) {
      setError('Please select a location and date/time.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Stronger zoom when showing stars
      if (mapRef.current && mapRef.current.flyTo) {
        mapRef.current.flyTo(selectedLocation, 12, { animate: true, duration: 1.2 });
        await new Promise(res => setTimeout(res, 1200));
      }
      const data = await fetchStars(selectedLocation, selectedDate);
      setStars(data.stars);
      setShowBigDipper(false);
      // Find zenith star (closest to clicked RA/Dec)
      let minDist = Infinity;
      let zenith: StarData | null = null;
      // Convert clicked lat/lng to radians
      const [lat, lng] = selectedLocation;
      const latRad = lat * Math.PI / 180;
      const lngRad = lng * Math.PI / 180;
      for (const star of data.stars) {
        if (star.ra == null || star.dec == null) continue;
        // Convert star RA/Dec to radians
        const raRad = (star.ra * 15) * Math.PI / 180; // RA in hours to deg to rad
        const decRad = star.dec * Math.PI / 180;
        // Angular distance (haversine on sphere)
        const d = Math.acos(
          Math.sin(latRad) * Math.sin(decRad) +
          Math.cos(latRad) * Math.cos(decRad) * Math.cos(lngRad - raRad)
        );
        if (d < minDist) {
          minDist = d;
          zenith = star;
        }
      }
      setZenithStar(zenith);
      setZenithPopupOpen(true);
    } catch (e: any) {
      if (e instanceof Error && (e as any).response && (e as any).response.status === 503) {
        setError('Catalogue unavailable.');
      } else if (e instanceof Error && e.message === 'Catalogue unavailable.') {
        setError('Catalogue unavailable.');
      } else {
        setError('Failed to fetch stars.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle map click: only set location and animate, do not fetch stars
  const handleMapClick = (coords: [number, number]) => {
    setSelectedLocation(coords);
    setError(null);
    if (!hasClickedMap) {
      if (mapRef.current && mapRef.current.flyTo) {
        mapRef.current.flyTo(coords, 6, { animate: true, duration: 1.2 });
      }
      setHasClickedMap(true);
    }
    // On subsequent clicks, do nothing (no pan, no zoom)
  };

  // Compute Big Dipper stars fixed at initial map center, correct for latitude distortion
  const lat0 = initialCenter.current![0];
  const lng0 = initialCenter.current![1];
  const meanRA = bigDipperData.reduce((sum, s) => sum + s.ra, 0) / bigDipperData.length;
  const meanDec = bigDipperData.reduce((sum, s) => sum + s.dec, 0) / bigDipperData.length;
  const cosLat = Math.cos(lat0 * Math.PI / 180);
  const bigDipperStars = bigDipperData.map(s => ({
    ...s,
    base_lat: lat0 + (s.dec - meanDec),
    base_lng: lng0 + ((s.ra - meanRA) * 15 * cosLat), // RA offset in deg, scaled by cos(lat)
    source_id: s.name,
    phot_g_mean_mag: s.phot_g_mean_mag,
    bp_rp: s.bp_rp,
    name: s.name,
    designation: s.designation,
    alt_diff: 0,
    az_diff: 0,
  }));

  return (
    <div className="fixed inset-0 min-h-screen h-screen w-full bg-gray-100 flex flex-col overflow-hidden">
      {/* Tutorial widget/modal (absolute for desktop, static for mobile) */}
      {tutorialStep !== null && (
        <div className="md:absolute md:top-8 md:right-8 md:left-auto left-0 top-0 w-full flex justify-center md:block z-50">
          <TutorialModal
            step={tutorialStep}
            onNext={() => {
              if (tutorialStep < 2) setTutorialStep(tutorialStep + 1);
              else setTutorialStep(null);
            }}
            onSkip={() => setTutorialStep(null)}
          />
        </div>
      )}
      {/* Main content layout */}
      <div className="flex flex-col items-center justify-center flex-1 w-full px-2 md:px-0">
        {/* Introduction Text (TypewriterHeadline) */}
        {showConstellation && (
          <div className="w-full flex justify-center mt-8 md:mt-0">
            <IntroOverlay
              text="Find your star in the cosmos."
              onFinish={(action) => {
                if (action === 'tutorial') setTutorialStep(0);
                setShowConstellation(false);
              }}
            />
          </div>
        )}
      </div>
      {/* Simple interactive date-time widget at the top */}
      <div className="w-full flex flex-col items-center mt-6 z-50">
        <label htmlFor="datetime-input" className="mb-1 text-base font-semibold text-gray-800">Select Date & Time</label>
        <input
          id="datetime-input"
          type="datetime-local"
          className="px-4 py-2 rounded-lg border border-gray-300 shadow focus:outline-none focus:ring-2 focus:ring-sky-400 text-gray-900 bg-white text-base w-full max-w-xs"
          value={selectedDate ? selectedDate.toISOString().slice(0, 16) : ''}
          onChange={e => setSelectedDate(e.target.value ? new Date(e.target.value) : null)}
        />
      </div>
      {/* Map and overlays (keep as is, below main widgets) */}
      <div className="map-bg">
        <MapSelector ref={mapRef} onLocationSelect={handleMapClick} selectedLocation={selectedLocation}>
          <StarOverlay 
            stars={showBigDipper ? bigDipperStars : stars} 
            fetchStarPDF={fetchStarPDF} 
            zenithStar={zenithStar}
            zenithPopupOpen={zenithPopupOpen}
            setZenithPopupOpen={setZenithPopupOpen}
            selectedDate={selectedDate}
          />
        </MapSelector>
      </div>
      {/* Resolution/device info (optional, for debugging) */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', background: 'rgba(0,0,0,0.08)', color: 'red', zIndex: 10000, fontSize: 14, textAlign: 'center', padding: '2px 0' }}>
        Resolution: {windowSize.width} x {windowSize.height} — Device: {getDeviceType(windowSize.width)}
      </div>
    </div>
  );
};

export default App;
