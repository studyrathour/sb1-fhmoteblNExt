import React, { useEffect, useState } from 'react';
import { Book, Play, Clock, Users } from 'lucide-react';
import { Batch, LiveClass } from '../types';
import { firebaseService } from '../services/firebase';
import { getVideoPlayerURL } from '../utils/videoPlayer';

interface EmbedWidgetProps {
  type: 'batches' | 'live';
  batchId?: string;
}

const EmbedWidget: React.FC<EmbedWidgetProps> = ({ type, batchId }) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribeBatches = firebaseService.onBatchesChange(setBatches);
    const unsubscribeLive = firebaseService.onLiveClassesChange(setLiveClasses);
    setIsLoading(false);

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

  if (isLoading) {
    return (
      <div className="p-4 bg-white">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (type === 'batches') {
    return (
      <div className="p-4 bg-white">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Book className="w-5 h-5 text-blue-600" />
          Available Courses
        </h2>
        
        {batches.length === 0 ? (
          <p className="text-gray-500">No courses available</p>
        ) : (
          <div className="grid gap-4">
            {batches.map((batch) => (
              <div key={batch.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  <img
                    src={batch.thumbnail}
                    alt={batch.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{batch.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{batch.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Book className="w-3 h-3" />
                        {batch.subjects?.length || 0} subjects
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {batch.enrolledStudents} enrolled
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (type === 'live') {
    const liveNow = liveClasses.filter(lc => lc.isLive && (!batchId || lc.batchId === batchId));
    const upcoming = liveClasses.filter(lc => !lc.isLive && new Date(lc.scheduledTime) > new Date() && (!batchId || lc.batchId === batchId));

    return (
      <div className="p-4 bg-white">
        {liveNow.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              Live Now
            </h2>
            <div className="space-y-3">
              {liveNow.map((liveClass) => (
                <div key={liveClass.id} className="border-2 border-red-200 rounded-lg p-4">
                  <div className="flex gap-4">
                    <img
                      src={liveClass.thumbnail}
                      alt={liveClass.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-red-600">LIVE</span>
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">{liveClass.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{liveClass.description}</p>
                      {liveClass.videoUrl && (
                        <a
                          href={getVideoPlayerURL(liveClass.videoUrl, true)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          <Play className="w-3 h-3" />
                          Join Live
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Upcoming Classes
          </h2>
          {upcoming.length === 0 ? (
            <p className="text-gray-500">No upcoming classes</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((liveClass) => (
                <div key={liveClass.id} className="border rounded-lg p-4">
                  <div className="flex gap-4">
                    <img
                      src={liveClass.thumbnail}
                      alt={liveClass.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{liveClass.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{liveClass.description}</p>
                      <div className="text-xs text-gray-500">
                        Starts in: <span className="font-medium">{getTimeUntilClass(liveClass.scheduledTime)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default EmbedWidget;