const React = require('react');
let rtl;
try {
  // require testing library dynamically so the test can still run (skip) if the lib isn't installed
  // eslint-disable-next-line global-require
  rtl = require('@testing-library/react-native');
} catch (e) {
  // will handle below by skipping tests if rtl not present
}

const Dashboard = require('../src/components/Dashboard').default;
const { DataContext } = require('../src/context/DataContext');

describe('Dashboard (render)', () => {
  const maybeIt = rtl ? it : it.skip;

  maybeIt('renders headings and counts from DataContext', () => {
    const sampleMileage = [
      { id: 't1', date: new Date().toISOString(), distance: 12.3 },
      { id: 't2', date: new Date().toISOString(), distance: 5.2 },
    ];
    const sampleExpenses = [{ id: 'e1', date: new Date().toISOString(), amount: 9.5 }];

    const { getByText, getAllByText } = rtl.render(
      React.createElement(DataContext.Provider, { value: { mileage: sampleMileage, expenses: sampleExpenses } },
        React.createElement(Dashboard, null)
      )
    );

    // Basic assertions to ensure important pieces are present
    expect(getByText(/This Week/i)).toBeTruthy();
    expect(getByText(/Last 30 Days/i)).toBeTruthy();
    // Routes label appears at least once
    expect(getAllByText(/Routes/i).length).toBeGreaterThanOrEqual(1);
    // Check that the routes count (2) is rendered somewhere
    expect(getByText('2')).toBeTruthy();
  });
});
