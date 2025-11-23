// Placeholder Amazon Flex service
// Add real API integration here when credentials and API details are available

export const fetchDeliveries = async (mock = true) => {
  if (mock) {
    return [
      { id: 'af-1', pickup: 'Location A', dropoff: 'Location B', status: 'completed' },
    ];
  }
  // TODO: fetch from Amazon Flex API
  return [];
};

export default { fetchDeliveries };
