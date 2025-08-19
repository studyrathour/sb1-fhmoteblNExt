import React, { useState, useEffect } from 'react';
import { Play, Book, Clock, Users, ChevronRight, Search, Filter } from 'lucide-react';
import { Batch, LiveClass } from '../types';
import { firebaseService } from '../services/firebase';
import { getVideoPlayerURL } from '../utils/videoPlayer';

const StudentInterface: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<'batches' | 'live' | 'content'>('batches');

  useEffect(() => {
    const unsubscribeBatches = firebaseService.onBatchesChange(setBatches);
    const unsubscribeLive = firebaseService.onLiveClassesChange(setLiveClasses);

    return () => {
      unsubscribeBatches();
      unsubscribeLive();
    };
  }, []);

  const getTimeUntilClass = (scheduledTime: Date) => {
    const now = new Date();
    const diff = scheduledTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Started';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const filteredBatches = batches.filter(batch =>
    batch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const liveNow = liveClasses.filter(lc => lc.isLive);
  const upcomingClasses = liveClasses.filter(lc => !lc.isLive && new Date(lc.scheduledTime) > new Date());

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-blue-600">EduMaster</h1>
              <nav className="hidden md:flex space-x-8">
                <button
                  onClick={() => {
                    setActiveView('batches');
                    setSelectedBatch(null);
                  }}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeView === 'batches' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Courses
                </button>
                <button
                  onClick={() => setActiveView('live')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeView === 'live' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Live Classes
                </button>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Live Classes View */}
        {activeView === 'live' && (
          <div className="space-y-8">
            {/* Live Now */}
            {liveNow.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                  Live Now
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {liveNow.map((liveClass) => (
                    <div key={liveClass.id} className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-red-200">
                      <img
                        src={liveClass.thumbnail}
                        alt={liveClass.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-red-600">LIVE</span>
                        </div>
                        <h3 className="font-semibold text-gray-800 mb-2">{liveClass.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">{liveClass.description}</p>
                        
                        {liveClass.videoUrl ? (
                          <a
                            href={getVideoPlayerURL(liveClass.videoUrl, true)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <Play className="w-4 h-4" />
                            Join Live Class
                          </a>
                        ) : (
                          <div className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg text-center">
                            Class Starting Soon
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Classes */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Clock className="w-6 h-6" />
                Upcoming Classes
              </h2>
              {upcomingClasses.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming classes scheduled</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingClasses.map((liveClass) => (
                    <div key={liveClass.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <img
                        src={liveClass.thumbnail}
                        alt={liveClass.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 mb-2">{liveClass.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">{liveClass.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            Starts in: <span className="font-medium">{getTimeUntilClass(liveClass.scheduledTime)}</span>
                          </div>
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Set Reminder
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Batches View */}
        {activeView === 'batches' && !selectedBatch && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Courses</h2>
            {filteredBatches.length === 0 ? (
              <div className="text-center py-12">
                <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No courses available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBatches.map((batch) => (
                  <div
                    key={batch.id}
                    onClick={() => {
                      setSelectedBatch(batch);
                      setActiveView('content');
                    }}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                  >
                    <img
                      src={batch.thumbnail}
                      alt={batch.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">{batch.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{batch.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Book className="w-4 h-4" />
                            {batch.subjects?.length || 0} subjects
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {batch.enrolledStudents} students
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content View */}
        {activeView === 'content' && selectedBatch && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => {
                  setSelectedBatch(null);
                  setActiveView('batches');
                }}
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
              >
                ← Back to Courses
              </button>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{selectedBatch.name}</h2>
            
            <div className="space-y-6">
              {selectedBatch.subjects?.map((subject) => (
                <div key={subject.id} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">{subject.name}</h3>
                  
                  <div className="space-y-4">
                    {subject.sections?.map((section) => (
                      <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-700 mb-3">{section.name}</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {section.contents?.map((content) => (
                            <div key={content.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                              {content.thumbnail && (
                                <img
                                  src={content.thumbnail}
                                  alt={content.title}
                                  className="w-full h-24 object-cover rounded mb-2"
                                />
                              )}
                              <h5 className="font-medium text-gray-800 text-sm mb-2">{content.title}</h5>
                              
                              <a
                                href={content.type === 'video' ? getVideoPlayerURL(content.url, false) : content.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-blue-600 text-white py-2 px-3 rounded text-sm text-center hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                              >
                                {content.type === 'video' ? (
                                  <>
                                    <Play className="w-3 h-3" />
                                    Watch
                                  </>
                                ) : (
                                  <>
                                    <Book className="w-3 h-3" />
                                    View
                                  </>
                                )}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentInterface;