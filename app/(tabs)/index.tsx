"use client";

import { DashboardScreen, StudentDashboardScreen } from '../../src/screens/DashboardScreen/DashboardScreen';
import { useAuth } from '../../src/contexts/AuthContext';

export default function HomeTab() {
  const { user } = useAuth();
  return user?.role === 'student' ? <StudentDashboardScreen /> : <DashboardScreen />;
}
