import React, { useState, useEffect } from 'react';
import { Book, Users, Edit, Trash2, AlertTriangle, FileJson, Plus } from 'lucide-react';
import { Batch } from '../types';
import { firebaseService } from '../services/firebase';
import toast from 'react-hot-toast';

interface BatchListProps {
  onEdit: (batch: Batch) => void;
  onNew: () => void;
}

const BatchList: React.FC<BatchListProps> = ({ onEdit, onNew }) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = firebaseService.onBatchesChange(
      (updatedBatches) => {
        setBatches(updatedBatches);
        setIsLoading(false);
        setError(null);
      },
      () => {
        setError('Could not load batches. Please check your connection and Firebase setup.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = async (batchId: string, batchName: string) => {
    if (window.confirm(`Are you sure you want to delete "${batchName}"? This action cannot be undone.`)) {
      try {
        await firebaseService.deleteBatch(batchId);
        toast.success('Batch deleted successfully');
      } catch (error) {
        toast.error('Failed to delete batch');
      }
    }
  };
  
  const handleExportJson = (batch: Batch) => {
    const exportData = {
      name: batch.name,
      description: batch.description,
      thumbnail: batch.thumbnail,
      subjects: batch.subjects.map(subject => ({
        name: subject.name,
        thumbnail: subject.thumbnail,
        sections: subject.sections.map(section => ({
          name: section.name,
          type: section.type,
          contents: section.contents.map(content => ({
            title: content.title,
            url: content.url,
            thumbnail: content.thumbnail || '',
          })),
        })),
      })),
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${batch.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${batch.name}.json`);
  };

  if (isLoading) {
    return (
      <div className="bg-surface rounded-lg shadow-md p-6 border border-secondary">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-secondary rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger/10 border border-danger/30 text-danger px-6 py-4 rounded-lg" role="alert">
        <div className="flex items-center">
          <AlertTriangle className="w-6 h-6 mr-3" />
          <div>
            <h3 className="font-bold text-lg">Connection Error</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-md p-6 border border-secondary">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
          <Book className="w-5 h-5" />
          All Batches
        </h2>
        <button
          onClick={onNew}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New Batch
        </button>
      </div>

      {batches.length === 0 ? (
        <div className="text-center py-8 text-text-secondary">
          <Book className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No batches available. Create or upload your first batch!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => (
            <div key={batch.id} className="border border-secondary rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-background">
              <img
                src={batch.thumbnail}
                alt={batch.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-text-primary mb-2">{batch.name}</h3>
                <p className="text-sm text-text-secondary mb-3 line-clamp-2">{batch.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-text-tertiary mb-4">
                  <div className="flex items-center gap-1">
                    <Book className="w-4 h-4" />
                    {batch.subjects?.length || 0} subjects
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {batch.enrolledStudents} students
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleExportJson(batch)}
                    className="flex-1 bg-indigo-500 text-white py-2 px-3 rounded hover:bg-indigo-600 text-sm flex items-center justify-center gap-1"
                  >
                    <FileJson className="w-4 h-4" />
                    JSON
                  </button>
                  <button
                    onClick={() => onEdit(batch)}
                    className="flex-1 bg-yellow-500 text-white py-2 px-3 rounded hover:bg-yellow-600 text-sm flex items-center justify-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(batch.id, batch.name)}
                    className="flex-1 bg-danger text-white py-2 px-3 rounded hover:bg-danger/80 text-sm flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BatchList;
