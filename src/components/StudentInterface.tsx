import React, { useState, useEffect } from 'react';
import { Book, AlertTriangle } from 'lucide-react';
import { Batch } from '../types';
import { firebaseService } from '../services/firebase';
import ContentExplorer from './ContentExplorer';

const StudentInterface: React.FC = () => {
  const [allBatches, setAllBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const handleError = (message: string) => {
      if (isMounted) {
        setError(message);
        setIsLoading(false);
      }
    };

    const unsubscribeBatches = firebaseService.onBatchesChange(
      (updatedBatches) => {
        if (isMounted) {
          setAllBatches(updatedBatches);
          setIsLoading(false);
        }
      },
      () => handleError("Failed to load courses. Please check your Firebase setup.")
    );

    return () => {
      isMounted = false;
      unsubscribeBatches();
    };
  }, []);

  const renderMainContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-24">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary text-lg">Loading Content...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-danger/10 border border-danger/30 text-text-primary px-6 py-4 rounded-lg" role="alert">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 mr-4 text-danger" />
            <div>
              <h3 className="font-bold text-xl mb-2">Connection Error</h3>
              <p className="text-text-secondary">{error}</p>
              <p className="text-sm text-text-tertiary mt-2">This is often due to an incomplete Firebase setup (e.g., Firestore database not created) or incorrect security rules.</p>
            </div>
          </div>
        </div>
      );
    }

    if (selectedBatch) {
      return <ContentExplorer batch={selectedBatch} onBackToCourses={() => setSelectedBatch(null)} />;
    }
    
    return (
      <div>
        {/* Removed the "All Courses" heading */}
        {allBatches.length === 0 ? (
          <div className="text-center py-12 bg-surface rounded-lg shadow-lg border border-secondary">
            <Book className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-secondary">No Courses Available</h3>
            <p className="text-text-tertiary mt-2">Content is being prepared. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allBatches.map((batch) => (
              <div 
                key={batch.id} 
                onClick={() => setSelectedBatch(batch)} 
                className="bg-surface rounded-lg overflow-hidden hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 transition-all cursor-pointer group border border-secondary"
              >
                <img src={batch.thumbnail} alt={batch.name} className="w-full h-48 object-cover"/>
                <div className="p-4">
                  <h3 className="font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors truncate">{batch.name}</h3>
                  <p className="text-sm text-text-secondary mb-4 line-clamp-2">{batch.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className={`flex-grow flex flex-col ${
        selectedBatch 
          ? 'p-4 sm:p-6' 
          : 'max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8'
      }`}>
        {renderMainContent()}
      </main>
    </div>
  );
};

export default StudentInterface;
