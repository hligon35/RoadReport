import { useContext } from 'react';
import { DataContext } from '../context/DataContext';

export const useDrives = () => {
  const { mileage, addRoute, updateRoute, deleteRoute } = useContext(DataContext);
  return { drives: mileage, addRoute, updateRoute, deleteRoute };
};

export default useDrives;
