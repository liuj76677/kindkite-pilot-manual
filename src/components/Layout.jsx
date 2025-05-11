import React, { useState } from 'react';
import GrantBrowser from './GrantBrowser';
import Workspace from './Workspace';

const Layout = () => {
  const [selectedGrantId, setSelectedGrantId] = useState(null);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Grant Browser */}
      <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto">
        <GrantBrowser selectedGrantId={selectedGrantId} onSelectGrant={setSelectedGrantId} />
      </div>

      {/* Main Workspace */}
      <div className="flex-1 overflow-hidden">
        <Workspace selectedGrantId={selectedGrantId} />
      </div>
    </div>
  );
};

export default Layout; 