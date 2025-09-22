import React, { useState } from 'react';
import { Camera, Plus, Edit2, Trash2, Settings } from 'lucide-react';

interface Camera {
  id: string;
  name: string;
  rtspUrl: string;
  location: string;
  isActive: boolean;
  status: 'online' | 'offline' | 'error';
  createdAt: Date;
}

const CameraManagement: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>([
    {
      id: 'cam-1',
      name: 'Front Entrance',
      rtspUrl: 'rtsp://demo:demo@192.168.1.101/stream1',
      location: 'Building A - Main Door',
      isActive: true,
      status: 'online',
      createdAt: new Date('2024-01-15')
    },
    {
      id: 'cam-2',
      name: 'Parking Lot',
      rtspUrl: 'rtsp://demo:demo@192.168.1.102/stream1',
      location: 'Building A - East Side',
      isActive: true,
      status: 'online',
      createdAt: new Date('2024-01-16')
    },
    {
      id: 'cam-3',
      name: 'Reception Area',
      rtspUrl: 'rtsp://demo:demo@192.168.1.103/stream1',
      location: 'Building A - Ground Floor',
      isActive: false,
      status: 'offline',
      createdAt: new Date('2024-01-17')
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    rtspUrl: '',
    location: ''
  });

  const handleAddCamera = () => {
    setEditingCamera(null);
    setFormData({ name: '', rtspUrl: '', location: '' });
    setIsModalOpen(true);
  };

  const handleEditCamera = (camera: Camera) => {
    setEditingCamera(camera);
    setFormData({
      name: camera.name,
      rtspUrl: camera.rtspUrl,
      location: camera.location
    });
    setIsModalOpen(true);
  };

  const handleDeleteCamera = (cameraId: string) => {
    if (confirm('Are you sure you want to delete this camera?')) {
      setCameras(prev => prev.filter(cam => cam.id !== cameraId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCamera) {
      // Update existing camera
      setCameras(prev => prev.map(cam => 
        cam.id === editingCamera.id 
          ? { ...cam, ...formData }
          : cam
      ));
    } else {
      // Add new camera
      const newCamera: Camera = {
        id: `cam-${Date.now()}`,
        ...formData,
        isActive: false,
        status: 'offline',
        createdAt: new Date()
      };
      setCameras(prev => [...prev, newCamera]);
    }
    
    setIsModalOpen(false);
    setFormData({ name: '', rtspUrl: '', location: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Camera Management</h1>
          <p className="text-gray-600">Add, edit, and manage your camera feeds</p>
        </div>
        
        <button
          onClick={handleAddCamera}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Camera
        </button>
      </div>

      {/* Camera List */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Cameras ({cameras.length})</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {cameras.map((camera) => (
            <div key={camera.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Camera className="h-10 w-10 text-gray-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-lg font-medium text-gray-900 truncate">
                        {camera.name}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        camera.status === 'online' 
                          ? 'bg-green-100 text-green-800' 
                          : camera.status === 'offline'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {camera.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-500 mt-1">{camera.location}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      RTSP: {camera.rtspUrl}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Created: {camera.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditCamera(camera)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => handleDeleteCamera(camera.id)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {cameras.length === 0 && (
            <div className="p-12 text-center">
              <Camera className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No cameras added</h3>
              <p className="text-gray-500 mb-6">Get started by adding your first camera feed.</p>
              <button
                onClick={handleAddCamera}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Camera
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setIsModalOpen(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingCamera ? 'Edit Camera' : 'Add New Camera'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {editingCamera ? 'Update camera information' : 'Configure your new camera feed'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Camera Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Front Entrance"
                  />
                </div>

                <div>
                  <label htmlFor="rtspUrl" className="block text-sm font-medium text-gray-700">
                    RTSP URL
                  </label>
                  <input
                    type="url"
                    id="rtspUrl"
                    required
                    value={formData.rtspUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, rtspUrl: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="rtsp://username:password@192.168.1.100/stream1"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Building A - Main Door"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    {editingCamera ? 'Update' : 'Add'} Camera
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraManagement;