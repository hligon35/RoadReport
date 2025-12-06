const React = require('react');
const renderer = require('react-test-renderer');
const Dashboard = require('../src/components/Dashboard').default;
const { DataContext } = require('../src/context/DataContext');

describe('Dashboard module', () => {
  it('exports a component (sanity)', () => {
    expect(typeof Dashboard).toBe('function');
  });
});
