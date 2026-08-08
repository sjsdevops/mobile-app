import { useLocalSearchParams } from 'expo-router';
import { QrScannerScreen } from '../src/screens/QrScanner/QrScanner';

export default function QrScannerRoute() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode = params.mode === 'punch-out' ? 'punch-out' : 'punch-in';
  return <QrScannerScreen mode={mode} />;
}
