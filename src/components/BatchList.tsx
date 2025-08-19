import React, { useState, useEffect } from 'react';
import { Book, Users, Edit, Trash2, Eye, Play } from 'lucide-react';
import { Batch } from '../types';
import { firebaseService } from '../services/firebase';
import toast from 'react-hot-toast';

interface BatchListProps {
  onEditBatch: (batch: Batch) => void;
  onViewBatch: (batch: Batch) => void;
}

const BatchList: React.FC<BatchListProps> = ({ onEditBatch, onViewBatch }) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebaseService.onBatchesChange((updatedBatches) => {
      setBatches(updatedBatches);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (batchId: string, batchName: string) => {
    if (window.confirm(`Are you sure you want to delete "${batchName}"?`)) {
      try {
        await firebaseService.deleteBatch(batchId);
        toast.success('Batch deleted successfully');
      } catch (error) {
        toast.error('Failed to delete batch');
      }
    }
  };

  const getEmbedCode = (type: 'batches' | 'live', batchId?: string) => {
    const baseUrl = window.location.origin;
    const embedUrl = type === 'batches' 
      ? `${baseUrl}/embed/batches`
      : `${baseUrl}/embed/live/${batchId}`;
    
    return `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0"></iframe>`;
  };

  const copyEmbedCode = (type: 'batches' | 'live', batchId?: string) => {
    const embedCode = getEmbedCode(type, batchId);
    navigator.clipboard.writeText(embedCode);
    toast.success('Embed code copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Book className="w-5 h-5" />
          All Batches
        </h2>
        <button
          onClick={() => copyEmbedCode('batches')}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          Get Embed Code
        </button>
      </div>

      {batches.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Book className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No batches available. Upload your first batch!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => (
            <div key={batch.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={batch.thumbnail}
                alt={batch.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{batch.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{batch.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
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
                    onClick={() => onViewBatch(batch)}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 text-sm flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => onEditBatch(batch)}
                    className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(batch.id, batch.name)}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
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