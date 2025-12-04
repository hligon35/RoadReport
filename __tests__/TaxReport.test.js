const TaxReport = require('../src/services/TaxReport').default;

test('calculateMileageDeduction returns correct values for simple trips', () => {
  const trips = [
    { id: 't1', distance: 10 },
    { id: 't2', distance: 20.5 },
  ];
  const result = TaxReport.calculateMileageDeduction(trips, 'business');
  expect(result.totalMiles).toBeCloseTo(30.5);
  expect(result.rate).toBeCloseTo(0.7);
  expect(result.deduction).toBeCloseTo(Number((30.5 * 0.7).toFixed(2)));
});
