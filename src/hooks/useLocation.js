import { useState, useRef, useEffect } from 'react';
// Placeholder hook using Expo Location
// Install: expo install expo-location
// import * as Location from 'expo-location';

// Simple Haversine distance helper
const toRad = (v) => (v * Math.PI) / 180;
const haversineDistance = (a, b) => {
  if (!a || !b) return 0;
  const R = 6371e3; // metres
  const φ1 = toRad(a.latitude);
  const φ2 = toRad(b.latitude);
  const Δφ = toRad(b.latitude - a.latitude);
  const Δλ = toRad(b.longitude - a.longitude);
  const ha = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(ha), Math.sqrt(1 - ha));
  const d = R * c; // in metres
  return d / 1609.344; // to miles
};

export const useLocationTracker = () => {
  const [tracking, setTracking] = useState(false);
  const [path, setPath] = useState([]);
  const [distanceMiles, setDistanceMiles] = useState(0);
  const lastPointRef = useRef(null);

  useEffect(() => {
    // TODO: initialize permissions and start location subscription when tracking=true
    // This is a skeleton to be filled with expo-location subscription
    return () => {
      // cleanup subscriptions
    };
  }, [tracking]);

  const start = async () => {
    setPath([]);
    setDistanceMiles(0);
    lastPointRef.current = null;
    setTracking(true);
    // TODO: request permissions and subscribe to Location updates
  };

  const stop = async () => {
    setTracking(false);
    // TODO: unsubscribe
  };

  const pushPoint = (point) => {
    setPath((p) => {
      const next = [...p, point];
      if (lastPointRef.current) {
        const d = haversineDistance(lastPointRef.current, point);
        setDistanceMiles((prev) => Number((prev + d).toFixed(3)));
      }
      lastPointRef.current = point;
      return next;
    });
  };

  return { tracking, path, distanceMiles, start, stop, pushPoint };
};

export default useLocationTracker;
