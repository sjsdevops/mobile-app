import { ReactNode } from 'react';
import { Box } from '@gluestack-ui/themed';

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = '' }: CardProps) {
  return (
    <Box className={`rounded-2xl bg-white p-4 shadow-sm ${className}`}>
      {children}
    </Box>
  );
}
