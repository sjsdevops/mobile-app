import { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box } from '@gluestack-ui/themed';

type ScreenProps = {
  children: ReactNode;
};

export function Screen({ children }: ScreenProps) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box className="flex-1 bg-slate-50">{children}</Box>
    </SafeAreaView>
  );
}
