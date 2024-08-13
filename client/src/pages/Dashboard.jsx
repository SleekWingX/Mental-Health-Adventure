// src/pages/Dashboard/Dashboard.jsx
import React from 'react';
import Auth from '../utils/auth';
import { Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  // Redirect to login if not authenticated
  if (!Auth.loggedIn()) {
    window.location.assign('/login');
    return null;
  }

  const user = Auth.getProfile(); // Assuming Auth.getProfile() gives user data from token

  return (
    <div className="dashboard">
      <h1>Welcome, {user.data.firstName}!</h1>
      <p>This is your dashboard. You can manage your profile and other settings here.</p>
      <div className="dashboard-links">
        <Link to="/donate" className="dashboard-link">
          Make a Donation
        </Link>
        {/* Add more links as needed */}
      </div>
    </div>
  );
}

export default Dashboard;
