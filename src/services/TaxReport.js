import { taxRates2025 } from '../data/taxRates';

// TaxReport service: calculates deductions based on mileage and expenses
export const calculateMileageDeduction = (routes = [], rateKey = 'business') => {
  const rate = taxRates2025[rateKey] ?? taxRates2025.business;
  const totalMiles = routes.reduce((sum, t) => sum + (t.distance || 0), 0);
  return {
    totalMiles,
    rate,
    deduction: Number((totalMiles * rate).toFixed(2)),
  };
};

export const calculateExpenseDeductions = (expenses = []) => {
  // Placeholder: categorize expenses and compute eligible deductions
  const totalsByCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + (e.amount || 0);
    return acc;
  }, {});
  return totalsByCategory;
};

export const generateTaxReport = ({ routes = [], trips = [], expenses = [], rateKey = 'business' }) => {
  const sourceRoutes = (routes && routes.length) ? routes : trips;
  const mileage = calculateMileageDeduction(sourceRoutes, rateKey);
  const expenseTotals = calculateExpenseDeductions(expenses);
  // Combine & return a report object. Export to CSV/PDF handled elsewhere.
  return {
    generatedAt: new Date().toISOString(),
    mileage,
    expenseTotals,
  };
};

export default {
  calculateMileageDeduction,
  calculateExpenseDeductions,
  generateTaxReport,
};
