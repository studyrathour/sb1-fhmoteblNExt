import React from 'react';

interface ContentThumbnailProps {
  title: string;
  teacherImageUrl?: string;
}

// A fallback placeholder in case no image is provided from the data.
const defaultThumbnail = 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/1280x720/19223c/f0f4f8?text=Missing+Thumbnail';

const ContentThumbnail: React.FC<ContentThumbnailProps> = ({ title, teacherImageUrl }) => {
  const imageUrl = teacherImageUrl || defaultThumbnail;

  return (
    <div className="relative w-full aspect-video bg-surface rounded-lg overflow-hidden border border-secondary group-hover:border-primary/50 transition-all duration-300">
      {/* The thumbnail image, which should cover the entire container. */}
      <img
        src={imageUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
        // In case the image fails to load, the parent div's background color will be visible.
        onError={(e) => {
          (e.target as HTMLImageElement).style.visibility = 'hidden';
        }}
      />

      {/* Container for the title, positioned on the left side as requested. */}
      <div className="absolute top-0 left-0 h-full w-[60%] flex items-center justify-center p-4">
        <h4 
          className="text-white font-bold text-center text-lg md:text-xl lg:text-2xl" 
          style={{ textShadow: '2px 2px 8px rgba(0, 0, 0, 0.95)' }}
        >
          {title}
        </h4>
      </div>
    </div>
  );
};

export default ContentThumbnail;
