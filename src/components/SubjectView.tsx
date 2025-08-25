import React, { useState, useMemo } from 'react';
import { Video, FileText, ClipboardCheck, HelpCircle, Play, Book } from 'lucide-react';
import { Subject, Content, Section } from '../types';
import { getVideoPlayerURL } from '../utils/videoPlayer';

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
  
  // Set initial active tab to the first available one
  useState(() => {
    if (availableTabs.length > 0) {
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activeContent.map(content => (
              <div key={content.id} className="border border-secondary rounded-lg bg-background p-3 hover:shadow-lg hover:border-primary/50 hover:-translate-y-0.5 transition-all group">
                {content.thumbnail && <img src={content.thumbnail} alt={content.title} className="w-full h-24 object-cover rounded mb-3"/>}
                <h5 className="font-medium text-text-primary text-sm mb-3 line-clamp-2 h-10">{content.title}</h5>
                <a 
                  href={content.type === 'video' ? getVideoPlayerURL(content.url, false) : content.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full bg-primary/10 text-primary py-2 px-3 rounded-md text-sm text-center hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-1.5 font-medium"
                >
                  {content.type === 'video' ? <><Play className="w-4 h-4" />Watch</> : <><Book className="w-4 h-4" />View</>}
                </a>
              </div>
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
