import { ActivityIndicator } from 'react-native';
import { Box, Text } from '@gluestack-ui/themed';

type StateMessageProps = {
  message: string;
  loading?: boolean;
};

export function StateMessage({ message, loading = false }: StateMessageProps) {
  return (
    <Box className="flex-1 items-center justify-center px-6">
      {loading ? <ActivityIndicator size="large" color="#144fcc" /> : null}
      <Text className="mt-3 text-center text-base text-slate-600">{message}</Text>
    </Box>
  );
}
