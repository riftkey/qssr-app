// Sidebar.js
import React from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
    return (
    <div
      className={`fixed top-0 left-0 h-full ${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-blue-500 text-white shadow-lg z-50 transition-all duration-300`}
    >
      <div className="flex items-center justify-between p-4 border-b border-blue-600">
        {!isCollapsed && <div className="text-2xl font-bold">QSSR</div>}
        <button onClick={toggleSidebar} className="text-white focus:outline-none">
          {isCollapsed ? <Menu size={24} /> : <X size={24} />}
        </button>
      </div>

      <nav className="mt-4 px-2 space-y-2">
        <a href="/dashboard" className="block py-2 px-3 rounded hover:bg-blue-600 text-sm">
          {!isCollapsed ? 'Dashboard' : '🏠'}
        </a>
        <a href="/editor-indikator" className="block py-2 px-3 rounded hover:bg-blue-600 text-sm">
          {!isCollapsed ? 'Editor Indikator' : '✏️'}
        </a>
        <a href="/indicator-list" className="block py-2 px-3 rounded hover:bg-blue-600 text-sm">
          {!isCollapsed ? 'Daftar Indikator' : '📄'}
        </a>
        <a href="/carbon-calculator" className="block py-2 px-3 rounded hover:bg-blue-600 text-sm">
          {!isCollapsed ? 'Kalkulator Karbon' : '🧮'}
        </a>
        <a href="/kalkulator-gia" className="block py-2 px-3 rounded hover:bg-blue-600 text-sm">
          {!isCollapsed ? 'Kalkulator GIA' : '🏢'}
        </a>
        <a href="/renewable-energy-calculator" className="block py-2 px-3 rounded hover:bg-blue-600 text-sm">
          {!isCollapsed ? 'Kalkulator Energi Terbarukan' : '🔋'}
        </a>
        <a href="/contacts" className="block py-2 px-3 rounded hover:bg-blue-600 text-sm">
          {!isCollapsed ? 'Daftar Kontak' : '📞'}
        </a>
        <a href="/research-partnership" className="block py-2 px-3 rounded hover:bg-blue-600 text-sm">
          {!isCollapsed ? 'Daftar Riset' : '🔬'}
        </a> 
        <a href="/demographics" className="block py-2 px-3 rounded hover:bg-blue-600 text-sm">
          {!isCollapsed ? 'Demografi' : '👥'}
        </a> 
        <a href="/historical-data" className="block py-2 px-3 rounded hover:bg-blue-600 text-sm">
          {!isCollapsed ? 'Historical Data' : '📊'}
        </a> 


        <button
          onClick={handleLogout}
          className="w-full text-left py-2 px-3 rounded hover:bg-blue-600 text-sm"
        >
          {!isCollapsed ? 'Logout' : '🚪'}
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
