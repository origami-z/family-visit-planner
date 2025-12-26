import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { FamilyPlannerProvider } from "@/context/FamilyPlannerContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { MembersView } from "@/components/members/MembersView";
import { CalendarView } from "@/components/calendar/CalendarView";
import { SettingsView } from "@/components/settings/SettingsView";

export const Route = createFileRoute('/')({ 
  component: App
});

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    if (dataParam) {
      try {
        const decoded = JSON.parse(atob(dataParam));
        localStorage.setItem('family-planner-data', JSON.stringify(decoded));
        window.location.href = '/';
      } catch (error) {
        console.error('Error loading shared data:', error);
      }
    }
  }, []);

  return (
    <FamilyPlannerProvider>
      <DashboardLayout activeSection={activeSection} onSectionChange={setActiveSection}>
        {activeSection === 'dashboard' && <DashboardView />}
        {activeSection === 'members' && <MembersView />}
        {activeSection === 'calendar' && <CalendarView />}
        {activeSection === 'settings' && <SettingsView />}
      </DashboardLayout>
    </FamilyPlannerProvider>
  );
}