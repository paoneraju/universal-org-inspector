import { Routes, Route, Navigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { Sidebar } from '../components/Sidebar';
import { ObjectSidebar } from '../features/objects/ObjectSidebar';
import { ObjectView } from './ObjectView';

export function AppLayoutPage() {
  return (
    <div className="h-screen flex flex-col bg-neutral-100 dark:bg-neutral-900">
      <TopBar />
      <div className="flex flex-1 min-h-0">
        <Sidebar>
          <ObjectSidebar />
        </Sidebar>
        <main className="flex-1 min-w-0 overflow-auto">
          <Routes>
            <Route path="/" element={<div className="p-4 text-neutral-500 dark:text-neutral-400">Select an object from the sidebar.</div>} />
            <Route path="object/:objectApiName" element={<ObjectView />} />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
