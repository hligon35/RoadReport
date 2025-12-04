import { useContext } from 'react';
import { DataContext } from '../context/DataContext';

export const useDrives = () => {
  const { mileage, addTrip, updateTrip, deleteTrip } = useContext(DataContext);
  return { drives: mileage, addTrip, updateTrip, deleteTrip };
};

export default useDrives;
