import React, { useState } from 'react';
import { 
  Home, 
  Upload, 
  Book, 
  Video, 
  Users, 
  Settings, 
  LogOut,
  BarChart3,
  Clock,
  CheckCircle
} from 'lucide-react';
import BatchUpload from './BatchUpload';
import BatchList from './BatchList';
import LiveClassScheduler from './LiveClassScheduler';
import { adminLogout } from '../utils/auth';
import { Batch } from '../types';
import toast from 'react-hot-toast';

interface AdminDashboardProps {
  onLogout: () => void;
}

type TabType = 'overview' | 'upload' | 'batches' | 'live' | 'students' | 'settings';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  const handleLogout = () => {
    adminLogout();
    toast.success('Logged out successfully');
    onLogout();
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Home },
    { id: 'upload', name: 'Upload Batches', icon: Upload },
    { id: 'batches', name: 'Manage Batches', icon: Book },
    { id: 'live', name: 'Live Classes', icon: Video },
    { id: 'students', name: 'Students', icon: Users },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Total Batches</p>
                      <p className="text-2xl font-bold text-blue-800">0</p>
                    </div>
                    <Book className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Live Classes</p>
                      <p className="text-2xl font-bold text-green-800">0</p>
                    </div>
                    <Video className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Total Students</p>
                      <p className="text-2xl font-bold text-purple-800">0</p>
                    </div>
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600 font-medium">Completion Rate</p>
                      <p className="text-2xl font-bold text-orange-800">0%</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-800">Welcome to your admin dashboard!</p>
                      <p className="text-xs text-gray-500">Start by uploading your first batch</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="w-full text-left p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <p className="text-sm font-medium text-blue-800">Upload New Batch</p>
                    <p className="text-xs text-blue-600">Add courses from folder structure</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('live')}
                    className="w-full text-left p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <p className="text-sm font-medium text-green-800">Schedule Live Class</p>
                    <p className="text-xs text-green-600">Set up upcoming live sessions</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'upload':
        return <BatchUpload />;
      case 'batches':
        return (
          <BatchList
            onEditBatch={(batch) => setSelectedBatch(batch)}
            onViewBatch={(batch) => setSelectedBatch(batch)}
          />
        );
      case 'live':
        return <LiveClassScheduler />;
      case 'students':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Student Management
            </h2>
            <div className="text-center py-8 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Student management features coming soon!</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Platform Settings
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3">Video Player Configuration</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Live Classes Prefix:</p>
                  <code className="text-sm bg-white p-2 rounded border">
                    https://edumastervideoplarerwatch.netlify.app/live/
                  </code>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 mt-3">
                  <p className="text-sm text-gray-600 mb-2">Recorded Content Prefix:</p>
                  <code className="text-sm bg-white p-2 rounded border">
                    https://edumastervideoplarerwatch.netlify.app/rec/
                  </code>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3">Firebase Configuration</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">✅ Connected to Firebase</p>
                  <p className="text-xs text-gray-500 mt-1">Project: nexttoppers-ab24d</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 bg-blue-600">
            <h1 className="text-white text-lg font-semibold">EduMaster Admin</h1>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.name}
              </button>
            ))}
          </nav>
          
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;