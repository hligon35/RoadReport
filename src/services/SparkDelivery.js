// Placeholder Spark Delivery (e.g., DoorDash/Spark) service module
export const fetchSparkDeliveries = async (mock = true) => {
  if (mock) {
    return [
      { id: 'sp-1', pickup: 'Store A', dropoff: 'Customer X', status: 'in_transit' },
    ];
  }
  // TODO: implement real API calls
  return [];
};

export default { fetchSparkDeliveries };
