import { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatPanel } from './components/ChatPanel';
import { QuickActions } from './components/QuickActions';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex gap-4 p-4 overflow-hidden">
            {/* Chat Panel */}
            <div className="flex-1 flex flex-col min-w-0">
              <ChatPanel />
            </div>

            {/* Quick Actions Panel */}
            <div className="hidden xl:block w-80 flex-shrink-0">
              <QuickActions />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
