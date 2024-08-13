import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App.jsx';
import Home from './pages/Home';
import Detail from './pages/Detail';
import NoMatch from './pages/NoMatch';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Success from './pages/Success';
import OrderHistory from './pages/OrderHistory';
import DonatePage from './pages/Donate';
import Dashboard from './pages/Dashboard'; // Import Dashboard component

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NoMatch />, // Corrected from 'error'
    children: [
      {
        index: true,
        element: <Home />
      }, 
      {
        path: '/login',
        element: <Login />
      }, 
      {
        path: '/signup',
        element: <Signup />
      }, 
      {
        path: '/success',
        element: <Success />
      }, 
      {
        path: '/orderHistory',
        element: <OrderHistory />
      }, 
      {
        path: '/products/:id',
        element: <Detail />
      },
      {
        path: '/donate',
        element: <DonatePage />
      },
      {
        path: '/dashboard',
        element: <Dashboard /> // Define the route for Dashboard
      }
    ]
  },
  {
    path: '*', // Catch-all route for unmatched paths
    element: <NoMatch />
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);
