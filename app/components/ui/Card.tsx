// components/ui/Card.tsx
import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';

interface CardProps {
  children: ReactNode;
}

const Card = ({ children }: CardProps) => {
  return <View style={styles.card}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
});

export default Card;
export { Card };
