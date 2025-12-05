// Mock bank integration service - placeholder for future real API hooks
const SAMPLE_TXNS = [
  { id: 'b-1', date: new Date().toISOString(), amount: 42.5, description: 'Gas Station', category: 'Gas' },
  { id: 'b-2', date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), amount: 120.0, description: 'Tire Shop', category: 'Tires' },
];

const fetchBankTransactions = async (opts = {}) => {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 300));
  // Return a mapped list that matches the expense schema used by the app
    return SAMPLE_TXNS.map((t) => ({
    id: `bank:${t.id}`,
    date: t.date,
    amount: t.amount,
    category: t.category,
    notes: t.description,
      classification: 'miscellaneous',
    source: 'bank',
  }));
};

const triggerDummyTransactions = async (onNewTx = () => {}) => {
  const tx = await fetchBankTransactions();
  // call callback for each transaction so UI can ingest
  tx.forEach(onNewTx);
  return tx;
};

export default {
  fetchBankTransactions,
  triggerDummyTransactions,
};
