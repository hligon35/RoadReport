import React, { useContext, useState } from 'react';
import { SafeAreaView, View, Text, Button } from 'react-native';
import { DataContext } from '../context/DataContext';
import TaxReportService from '../services/TaxReport';

const ReportsScreen = () => {
  const { mileage, expenses } = useContext(DataContext);
  const [report, setReport] = useState(null);

  const generate = () => {
    const r = TaxReportService.generateTaxReport({ trips: mileage, expenses });
    setReport(r);
    // placeholder: export CSV or PDF
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 22 }}>Reports</Text>
        <Button title="Generate Tax Report" onPress={generate} />
        {report && (
          <View style={{ marginTop: 12 }}>
            <Text>Generated: {report.generatedAt}</Text>
            <Text>Estimated Deduction: ${report.mileage.deduction}</Text>
            <Text>Expense Summary: {JSON.stringify(report.expenseTotals)}</Text>
            <Text style={{ marginTop: 8 }}>(Export to CSV/PDF placeholder)</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ReportsScreen;
