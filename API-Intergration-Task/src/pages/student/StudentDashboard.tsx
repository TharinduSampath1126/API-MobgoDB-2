import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-lg">Welcome, {user?.name}!</p>
        <p className="text-sm text-gray-600">Role: {user?.role}</p>
        <p className="text-sm text-gray-600">Email: {user?.email}</p>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">My Courses</h3>
          <p className="text-gray-600">View your enrolled courses</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Assignments</h3>
          <p className="text-gray-600">Check your assignments</p>
        </div>
      </div>
    </div>
  );
};