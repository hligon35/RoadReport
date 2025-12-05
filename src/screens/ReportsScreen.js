import React, { useContext, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Button, Alert } from 'react-native';
import { DataContext } from '../context/DataContext';
import TaxReportService from '../services/TaxReport';
import ExportService from '../services/ExportService';

const ReportsScreen = () => {
  const { mileage, expenses } = useContext(DataContext);
  const [report, setReport] = useState(null);

  const generate = () => {
    const r = TaxReportService.generateTaxReport({ routes: mileage, expenses });
    setReport(r);
    // placeholder: export CSV or PDF
  };

  const exportCSV = async () => {
    const csv = ExportService.generateRoutesCSV(mileage);
    const path = await ExportService.saveCSVToFile(`roadreport_${Date.now()}.csv`, csv);
    if (path) {
      Alert.alert('Export complete', `CSV saved to ${path}`);
    }
  };

  const exportPDF = async () => {
    const html = ExportService.generateRoutesHTML(mileage);
    const path = await ExportService.saveHTMLAsPDF(`roadreport_${Date.now()}.pdf`, html);
    if (path) {
      Alert.alert('Export complete', `PDF saved to ${path}`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={[ 'left', 'right', 'bottom' ]}>
      <View style={{ padding: 16 }}>
        <Button title="Generate Tax Report" onPress={generate} />
        {report && (
          <View style={{ marginTop: 12 }}>
            <Text>Generated: {report.generatedAt}</Text>
            <Text>Estimated Deduction: ${report.mileage.deduction}</Text>
            <Text>Expense Summary: {JSON.stringify(report.expenseTotals)}</Text>
            <Text style={{ marginTop: 8 }}>(Export to CSV/PDF placeholder)</Text>
          </View>
        )}
        <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'space-around' }}>
          <Button title="Export CSV" onPress={exportCSV} />
          <Button title="Export PDF" onPress={exportPDF} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ReportsScreen;
