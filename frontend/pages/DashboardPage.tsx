import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useAlertStore } from '../store/alertStore';
import { useReminderStore } from '../store/reminderStore';
import { useMemoryStore } from '../store/memoryStore';
import { UserRole } from '../types';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUserById } from '../src/api/userApi';

// ==========================
// UI CARD
// ==========================
const DashboardCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow border border-white/50"
  >
    {children}
  </motion.div>
);

// ==========================
// PATIENT DASHBOARD
// ==========================
const PatientDashboard = () => {
  const { addAlert } = useAlertStore();
  const { reminders, fetchReminders } = useReminderStore();
  const { memories, fetchMemories } = useMemoryStore();
  const { user } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    fetchReminders();
    fetchMemories();
  }, [location.key]);

  const upcomingReminders = reminders.filter(r => !r.isCompleted).slice(0, 3);

  const handleSOS = async () => {
    await addAlert({
      type: 'SOS',
      message: `${user?.name || 'Patient'} triggered SOS!`
    });
    alert("Help is on the way 🚨");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-12">
      <h2 className="text-3xl font-bold">Hello, {user?.name} 👋</h2>

      <Button onClick={handleSOS} variant="danger" className="w-full py-4 text-lg">
        🚨 SOS — Call for Help
      </Button>

      <DashboardCard>
        <h3 className="text-lg font-bold mb-3">Upcoming Reminders</h3>
        {upcomingReminders.length === 0 ? (
          <p className="text-gray-400 text-sm">No upcoming reminders</p>
        ) : (
          upcomingReminders.map(r => (
            <div key={r.id} className="border-b py-2 text-sm">
              <p className="font-semibold">{r.title}</p>
              <p className="text-gray-500">{new Date(r.time).toLocaleString()}</p>
            </div>
          ))
        )}
      </DashboardCard>

      <DashboardCard>
        <h3 className="text-lg font-bold mb-3">My Memories</h3>
        {memories.length === 0 ? (
          <p className="text-gray-400 text-sm">No memories yet</p>
        ) : (
          memories.slice(0, 3).map(m => (
            <div key={m.id} className="border-b py-2 text-sm">
              <p className="font-semibold">{m.title}</p>
              <p className="text-gray-500">{new Date(m.date).toLocaleDateString('en-IN')}</p>
            </div>
          ))
        )}
      </DashboardCard>
    </div>
  );
};

// ==========================
// CARETAKER DASHBOARD
// ==========================
const CaretakerDashboard = () => {
  const { alerts, fetchAlerts } = useAlertStore();
  const { reminders, fetchReminders } = useReminderStore();
  const { memories, fetchMemories } = useMemoryStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [patientName, setPatientName] = React.useState<string | null>(null);

  useEffect(() => {
    fetchReminders();
    fetchMemories();
    fetchAlerts();

    const fetchPatientName = async () => {
      try {
        if (!user?.patientId) return;
        const data = await getUserById(user.patientId);
        const name = data?.name || data?.user?.name || data?.data?.name || 'Unknown';
        setPatientName(name);
      } catch {
        setPatientName('Unknown');
      }
    };
    fetchPatientName();

    const interval = setInterval(() => {
      fetchMemories();
      fetchReminders();
      fetchAlerts();
    }, 15000);

    return () => clearInterval(interval);
  }, [location.key]);

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-12">
      <h2 className="text-3xl font-bold">Caretaker Dashboard</h2>

      <DashboardCard>
        <h3 className="text-lg font-bold mb-2">Patient Info</h3>
        <p className="text-sm"><b>Name:</b> {patientName ?? 'Loading...'}</p>
        <p className="text-sm"><b>Patient ID:</b> {user?.patientId}</p>
      </DashboardCard>

      <DashboardCard>
        <h3 className="text-lg font-bold mb-2">Recent Alerts</h3>
        {alerts.length === 0 ? (
          <p className="text-gray-400 text-sm">No alerts</p>
        ) : (
          alerts.slice(0, 3).map(a => (
            <div key={a.id} className="border-b py-2 text-sm">
              <p className={`font-semibold ${a.type === 'SOS' ? 'text-red-600' : 'text-orange-500'}`}>{a.type === 'SOS' ? 'SOS' : 'Safe Zone Exit'}</p>
              <p>{a.message}</p>
            </div>
          ))
        )}
      </DashboardCard>

      <DashboardCard>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold">Reminders</h3>
          <Button size="sm" onClick={() => navigate('/reminders')}>View All</Button>
        </div>
        {reminders.length === 0 ? (
          <p className="text-gray-400 text-sm">No reminders</p>
        ) : (
          reminders.slice(0, 4).map(r => (
            <div key={r.id} className="border-b py-2 text-sm">
              <p className={r.isCompleted ? 'line-through text-gray-400' : 'font-semibold'}>{r.title}</p>
              <p className="text-gray-500">{new Date(r.time).toLocaleString('en-IN')}</p>
            </div>
          ))
        )}
      </DashboardCard>

      <DashboardCard>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold">Memories</h3>
          <Button size="sm" onClick={() => navigate('/memories')}>View All</Button>
        </div>
        {memories.length === 0 ? (
          <p className="text-gray-400 text-sm">No memories</p>
        ) : (
          memories.slice(0, 4).map(m => (
            <div key={m.id} className="border-b py-2 text-sm">
              <p className="font-semibold">{m.title}</p>
              <p className="text-gray-500">{new Date(m.date).toLocaleDateString('en-IN')}</p>
            </div>
          ))
        )}
      </DashboardCard>
    </div>
  );
};

// ==========================
// MAIN PAGE
// ==========================
const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (user.role === UserRole.PATIENT) {
    return <PatientDashboard />;
  }

  if (user.role === UserRole.CARETAKER) {
    return <CaretakerDashboard />;
  }

  return <div>Invalid role</div>;
};

export default DashboardPage;