import React, { useState, useRef } from 'react';
import { Upload, FolderOpen, FileSpreadsheet, Eye, Plus } from 'lucide-react';
import { processFolderStructure } from '../utils/xlsxParser';
import { firebaseService } from '../services/firebase';
import toast from 'react-hot-toast';

const BatchUpload: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFolderUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const batchStructure = await processFolderStructure(files);
      setPreviewData(batchStructure);
      setShowPreview(true);
      toast.success('Folder structure processed successfully!');
    } catch (error) {
      toast.error('Failed to process folder structure');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadToFirebase = async () => {
    if (!previewData) return;

    setIsUploading(true);
    try {
      for (const batchName of Object.keys(previewData)) {
        const batchData = previewData[batchName];
        
        // Convert subjects object to array format
        const subjects = Object.keys(batchData.subjects).map(subjectName => ({
          id: Math.random().toString(36).substr(2, 9),
          name: subjectName,
          thumbnail: 'https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg?auto=compress&cs=tinysrgb&w=400',
          sections: Object.keys(batchData.subjects[subjectName].sections).map(sectionName => ({
            id: Math.random().toString(36).substr(2, 9),
            name: sectionName,
            type: batchData.subjects[subjectName].sections[sectionName].type,
            contents: batchData.subjects[subjectName].sections[sectionName].contents.map((content: any) => ({
              id: Math.random().toString(36).substr(2, 9),
              title: content.title,
              url: content.url,
              type: batchData.subjects[subjectName].sections[sectionName].type,
              thumbnail: 'https://images.pexels.com/photos/4050291/pexels-photo-4050291.jpeg?auto=compress&cs=tinysrgb&w=400'
            }))
          }))
        }));

        await firebaseService.addBatch({
          name: batchData.name,
          description: `Automatically created batch from folder: ${batchData.name}`,
          thumbnail: 'https://images.pexels.com/photos/5427656/pexels-photo-5427656.jpeg?auto=compress&cs=tinysrgb&w=800',
          subjects,
          createdAt: new Date(),
          isActive: true,
          enrolledStudents: 0
        });
      }

      toast.success('All batches uploaded successfully!');
      setPreviewData(null);
      setShowPreview(false);
      if (folderInputRef.current) {
        folderInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('Failed to upload batches to Firebase');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <Upload className="w-5 h-5" />
        Batch Upload
      </h2>

      <div className="space-y-6">
        {/* Folder Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Batch Folder
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
            <input
              ref={folderInputRef}
              type="file"
              webkitdirectory=""
              multiple
              onChange={handleFolderUpload}
              className="hidden"
              id="folderUpload"
            />
            <label htmlFor="folderUpload" className="cursor-pointer">
              <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-600 mb-2">
                Select Batch Folder
              </p>
              <p className="text-sm text-gray-500">
                Choose a folder containing subjects with XLSX files
              </p>
            </label>
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && previewData && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Preview Structure
              </h3>
              <button
                onClick={handleUploadToFirebase}
                disabled={isUploading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Upload to Firebase
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              {Object.keys(previewData).map((batchName) => (
                <div key={batchName} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">
                    📚 Batch: {batchName}
                  </h4>
                  <div className="space-y-2">
                    {Object.keys(previewData[batchName].subjects).map((subjectName) => (
                      <div key={subjectName} className="bg-white rounded p-3">
                        <h5 className="font-medium text-gray-700 mb-2">
                          📖 Subject: {subjectName}
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {Object.keys(previewData[batchName].subjects[subjectName].sections).map((sectionName) => {
                            const section = previewData[batchName].subjects[subjectName].sections[sectionName];
                            return (
                              <div key={sectionName} className="bg-gray-50 rounded p-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                                  <span className="text-sm font-medium">{sectionName}</span>
                                </div>
                                <p className="text-xs text-gray-600">
                                  {section.contents?.length || 0} items
                                </p>
                              </div>
                            );
                          })}
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

export default BatchUpload;