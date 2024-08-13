// src/App.jsx
import { Outlet, Route, Routes, Navigate } from 'react-router-dom';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import Nav from './components/Nav';
import { StoreProvider } from './utils/GlobalState';
import Dashboard from './pages/Dashboard'; // Import Dashboard component
import DonatePage from './pages/Donate'; // Import Donate component
import LoginPage from './pages/Login'; // Import Login component
import SignupPage from './pages/Signup'; // Import Signup component
import HomePage from './pages/Home'; // Import Home component
import Auth from './utils/auth'; // Import your Auth utility

const httpLink = createHttpLink({
  uri: '/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('id_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

const ProtectedRoute = ({ children }) => {
  return Auth.loggedIn() ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ApolloProvider client={client}>
      <StoreProvider>
        <Nav />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donate"
            element={
              <ProtectedRoute>
                <DonatePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </StoreProvider>
    </ApolloProvider>
  );
}

export default App;
