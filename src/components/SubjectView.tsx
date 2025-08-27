import React, { useState, useMemo } from 'react';
import { Video, FileText, ClipboardCheck, HelpCircle, Play, Book } from 'lucide-react';
import { Subject, Content } from '../types';
import { getVideoPlayerURL } from '../utils/videoPlayer';
import ContentThumbnail from './ContentThumbnail';

type ContentType = 'video' | 'notes' | 'assignment' | 'quiz';

const iconMap: { [key in ContentType]: React.ElementType } = {
  video: Video,
  notes: FileText,
  assignment: ClipboardCheck,
  quiz: HelpCircle,
};

const SubjectView: React.FC<{ subject: Subject }> = ({ subject }) => {
  const [activeTab, setActiveTab] = useState<ContentType>('video');

  const contentByType = useMemo(() => {
    const grouped: Record<ContentType, Content[]> = {
      video: [],
      notes: [],
      assignment: [],
      quiz: [],
    };

    subject.sections?.forEach(section => {
      if (grouped[section.type]) {
        grouped[section.type].push(...section.contents);
      }
    });

    return grouped;
  }, [subject]);

  const availableTabs = Object.keys(contentByType).filter(
    type => contentByType[type as ContentType].length > 0
  ) as ContentType[];
  
  useState(() => {
    if (availableTabs.length > 0 && !availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0]);
    }
  });

  const activeContent = contentByType[activeTab];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 border-b border-secondary mb-4">
        <nav className="flex space-x-4">
          {availableTabs.map(tab => {
            const Icon = iconMap[tab];
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-3 py-3 text-sm font-medium transition-colors border-b-2
                  ${activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span className="capitalize">{tab}s</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex-grow overflow-y-auto">
        {activeContent.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeContent.map(content => (
              <a 
                key={content.id}
                href={content.type === 'video' ? getVideoPlayerURL(content.url, false) : content.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block relative"
              >
                <ContentThumbnail title={content.title} teacherImageUrl={content.thumbnail} />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg duration-300">
                  <div className="bg-primary text-white rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform">
                    {content.type === 'video' ? <Play className="w-6 h-6 fill-white" /> : <Book className="w-6 h-6" />}
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-text-tertiary">
            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4">
              <Video className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-text-secondary">No Content Yet</h3>
            <p>This section is currently empty. Check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectView;
