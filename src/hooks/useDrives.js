import { useContext } from 'react';
import { DataContext } from '../context/DataContext';

export const useRoutes = () => {
  const { mileage, addRoute, updateRoute, deleteRoute } = useContext(DataContext);
  return { routes: mileage, addRoute, updateRoute, deleteRoute };
};

export default useRoutes;
