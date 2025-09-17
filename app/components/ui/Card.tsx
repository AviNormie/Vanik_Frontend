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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default Card;
export { Card };
