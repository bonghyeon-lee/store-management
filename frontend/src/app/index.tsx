import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@app/providers/apollo';
import { Header } from '@widgets/header/ui/Header';
import { HomePage } from '@pages/home/ui/HomePage';

export const App: React.FC = () => {
  return (
    <ApolloProvider client={apolloClient}>
      <Header />
      <main style={{ padding: 16 }}>
        <HomePage />
      </main>
    </ApolloProvider>
  );
};

export default App;


