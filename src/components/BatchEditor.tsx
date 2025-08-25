import React, { useState, useEffect } from 'react';
import { produce } from 'immer';
import { Save, X, Plus, Trash2, ArrowLeft, ImagePlus } from 'lucide-react';
import { Batch, Subject, Section, Content } from '../types';
import { firebaseService } from '../services/firebase';
import toast from 'react-hot-toast';

interface BatchEditorProps {
  batchToEdit: Batch | null;
  onClose: () => void;
}

const NEW_BATCH_TEMPLATE: Omit<Batch, 'id' | 'createdAt' | 'isActive' | 'enrolledStudents'> = {
  name: '',
  description: '',
  thumbnail: 'https://images.pexels.com/photos/5427656/pexels-photo-5427656.jpeg?auto=compress&cs=tinysrgb&w=800',
  subjects: [],
};

const BatchEditor: React.FC<BatchEditorProps> = ({ batchToEdit, onClose }) => {
  const [batchData, setBatchData] = useState<Omit<Batch, 'id'>>(
    () => batchToEdit || { ...NEW_BATCH_TEMPLATE, createdAt: new Date(), isActive: true, enrolledStudents: 0 }
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (batchToEdit) {
      setBatchData(batchToEdit);
    } else {
      setBatchData({ ...NEW_BATCH_TEMPLATE, createdAt: new Date(), isActive: true, enrolledStudents: 0 });
    }
  }, [batchToEdit]);

  const handleBatchChange = (field: keyof Batch, value: string) => {
    setBatchData(produce(draft => {
      (draft as any)[field] = value;
    }));
  };

  const handleNestedChange = (path: (string | number)[], value: any) => {
    setBatchData(produce(draft => {
      let current: any = draft;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
    }));
  };

  const addSubject = () => {
    const newSubject: Subject = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Subject',
      thumbnail: 'https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg?auto=compress&cs=tinysrgb&w=400',
      sections: [],
    };
    setBatchData(produce(draft => {
      draft.subjects.push(newSubject);
    }));
  };

  const deleteSubject = (subjectIndex: number) => {
    if (window.confirm('Are you sure you want to delete this subject and all its content?')) {
      setBatchData(produce(draft => {
        draft.subjects.splice(subjectIndex, 1);
      }));
    }
  };
  
  const addSection = (subjectIndex: number) => {
    const newSection: Section = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Section',
      type: 'video',
      contents: [],
    };
    setBatchData(produce(draft => {
      draft.subjects[subjectIndex].sections.push(newSection);
    }));
  };

  const deleteSection = (subjectIndex: number, sectionIndex: number) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      setBatchData(produce(draft => {
        draft.subjects[subjectIndex].sections.splice(sectionIndex, 1);
      }));
    }
  };

  const addContent = (subjectIndex: number, sectionIndex: number) => {
    const newContent: Content = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Content',
      url: '',
      type: batchData.subjects[subjectIndex].sections[sectionIndex].type,
      thumbnail: 'https://images.pexels.com/photos/4050291/pexels-photo-4050291.jpeg?auto=compress&cs=tinysrgb&w=400',
    };
    setBatchData(produce(draft => {
      draft.subjects[subjectIndex].sections[sectionIndex].contents.push(newContent);
    }));
  };

  const deleteContent = (subjectIndex: number, sectionIndex: number, contentIndex: number) => {
    setBatchData(produce(draft => {
      draft.subjects[subjectIndex].sections[sectionIndex].contents.splice(contentIndex, 1);
    }));
  };

  const handleBulkThumbnail = (subjectIndex: number, sectionIndex: number) => {
    const newThumbnail = window.prompt('Enter the URL for the new thumbnail for all items in this section:');
    if (newThumbnail) {
      setBatchData(produce(draft => {
        draft.subjects[subjectIndex].sections[sectionIndex].contents.forEach(content => {
          content.thumbnail = newThumbnail;
        });
      }));
      toast.success('Thumbnails updated for the section!');
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (batchToEdit) {
        await firebaseService.updateBatch(batchToEdit.id, batchData);
        toast.success('Batch updated successfully!');
      } else {
        await firebaseService.addBatch(batchData);
        toast.success('Batch created successfully!');
      }
      onClose();
    } catch (error) {
      toast.error('Failed to save batch.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyles = "w-full mt-1 p-2 border border-secondary rounded-md bg-background focus:ring-1 focus:ring-primary focus:border-primary";
  const smallInputStyles = "w-full p-1 border border-secondary rounded-md text-sm bg-background focus:ring-1 focus:ring-primary focus:border-primary";

  return (
    <div className="bg-surface rounded-lg shadow-md p-6 border border-secondary">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onClose} className="flex items-center gap-2 text-primary font-medium">
          <ArrowLeft className="w-5 h-5" />
          Back to List
        </button>
        <h2 className="text-xl font-semibold text-text-primary">
          {batchToEdit ? 'Edit Batch' : 'Create New Batch'}
        </h2>
      </div>

      <div className="space-y-6">
        {/* Batch Details */}
        <div className="border border-secondary rounded-lg p-4 space-y-4">
          <h3 className="font-medium text-lg text-text-primary">Batch Details</h3>
          <div>
            <label className="block text-sm font-medium text-text-secondary">Batch Name</label>
            <input type="text" value={batchData.name} onChange={(e) => handleBatchChange('name', e.target.value)} className={inputStyles}/>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary">Description</label>
            <textarea value={batchData.description} onChange={(e) => handleBatchChange('description', e.target.value)} className={inputStyles} rows={3}></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary">Thumbnail URL</label>
            <input type="text" value={batchData.thumbnail} onChange={(e) => handleBatchChange('thumbnail', e.target.value)} className={inputStyles}/>
          </div>
        </div>

        {/* Subjects */}
        <div className="space-y-4">
          {batchData.subjects.map((subject, sIdx) => (
            <div key={subject.id} className="border border-secondary rounded-lg p-4 space-y-4 bg-background">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-lg text-text-primary">Subject: {subject.name}</h4>
                <button onClick={() => deleteSubject(sIdx)} className="text-danger p-1 rounded-full hover:bg-danger/10"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={subject.name} onChange={(e) => handleNestedChange(['subjects', sIdx, 'name'], e.target.value)} placeholder="Subject Name" className={inputStyles}/>
                <input type="text" value={subject.thumbnail} onChange={(e) => handleNestedChange(['subjects', sIdx, 'thumbnail'], e.target.value)} placeholder="Subject Thumbnail URL" className={inputStyles}/>
              </div>

              {/* Sections */}
              <div className="space-y-3 pl-4">
                {subject.sections.map((section, secIdx) => (
                  <div key={section.id} className="border border-secondary rounded-lg p-3 bg-surface">
                    <div className="flex justify-between items-center mb-2">
                       <h5 className="font-medium text-text-primary">Section: {section.name}</h5>
                       <button onClick={() => deleteSection(sIdx, secIdx)} className="text-danger p-1 rounded-full hover:bg-danger/10"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <input type="text" value={section.name} onChange={(e) => handleNestedChange(['subjects', sIdx, 'sections', secIdx, 'name'], e.target.value)} placeholder="Section Name" className={`flex-grow ${inputStyles}`}/>
                      <select value={section.type} onChange={(e) => handleNestedChange(['subjects', sIdx, 'sections', secIdx, 'type'], e.target.value)} className={inputStyles}>
                        <option value="video">Video</option>
                        <option value="notes">Notes</option>
                        <option value="assignment">Assignment</option>
                        <option value="quiz">Quiz</option>
                      </select>
                    </div>
                    
                    {/* Contents */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h6 className="text-sm font-medium text-text-secondary">Contents</h6>
                        <button onClick={() => handleBulkThumbnail(sIdx, secIdx)} className="text-xs bg-secondary px-2 py-1 rounded hover:bg-primary/20 flex items-center gap-1"><ImagePlus className="w-3 h-3"/>Bulk Thumbnail</button>
                      </div>
                      {section.contents.map((content, cIdx) => (
                        <div key={content.id} className="flex items-center gap-2 bg-background p-2 rounded">
                          <div className="flex-grow space-y-1">
                            <input type="text" value={content.title} onChange={(e) => handleNestedChange(['subjects', sIdx, 'sections', secIdx, 'contents', cIdx, 'title'], e.target.value)} placeholder="Content Title" className={smallInputStyles}/>
                            <input type="text" value={content.url} onChange={(e) => handleNestedChange(['subjects', sIdx, 'sections', secIdx, 'contents', cIdx, 'url'], e.target.value)} placeholder="Content URL" className={smallInputStyles}/>
                            <input type="text" value={content.thumbnail} onChange={(e) => handleNestedChange(['subjects', sIdx, 'sections', secIdx, 'contents', cIdx, 'thumbnail'], e.target.value)} placeholder="Thumbnail URL" className={smallInputStyles}/>
                          </div>
                          <button onClick={() => deleteContent(sIdx, secIdx, cIdx)} className="text-danger p-1 rounded-full hover:bg-danger/10 self-start"><X className="w-4 h-4" /></button>
                        </div>
                      ))}
                      <button onClick={() => addContent(sIdx, secIdx)} className="text-sm text-primary flex items-center gap-1 mt-2"><Plus className="w-3 h-3"/>Add Content</button>
                    </div>
                  </div>
                ))}
                <button onClick={() => addSection(sIdx)} className="text-sm text-primary flex items-center gap-1"><Plus className="w-3 h-3"/>Add Section</button>
              </div>
            </div>
          ))}
          <button onClick={addSubject} className="bg-primary/10 text-primary px-4 py-2 rounded-lg hover:bg-primary/20 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Subject
          </button>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <button onClick={onClose} className="bg-secondary text-text-primary px-6 py-2 rounded-lg hover:bg-primary/20">Cancel</button>
        <button onClick={handleSave} disabled={isLoading} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/80 disabled:opacity-50 flex items-center gap-2">
          {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-5 h-5" />}
          {isLoading ? 'Saving...' : 'Save Batch'}
        </button>
      </div>
    </div>
  );
};

export default BatchEditor;
