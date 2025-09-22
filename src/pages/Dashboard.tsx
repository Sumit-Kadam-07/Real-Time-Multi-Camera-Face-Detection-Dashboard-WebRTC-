import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { Camera, Play, Pause, AlertCircle, Activity, Wifi } from 'lucide-react';

interface CameraFeed {
  id: string;
  name: string;
  rtspUrl: string;
  isActive: boolean;
  status: 'online' | 'offline' | 'error';
  location: string;
}

const Dashboard: React.FC = () => {
  const { alerts, cameraStats } = useWebSocket();
  const [cameras, setCameras] = useState<CameraFeed[]>([
    {
      id: 'cam-1',
      name: 'Front Entrance',
      rtspUrl: 'rtsp://demo:demo@192.168.1.101/stream1',
      isActive: true,
      status: 'online',
      location: 'Building A - Main Door'
    },
    {
      id: 'cam-2',
      name: 'Parking Lot',
      rtspUrl: 'rtsp://demo:demo@192.168.1.102/stream1',
      isActive: true,
      status: 'online',
      location: 'Building A - East Side'
    },
    {
      id: 'cam-3',
      name: 'Reception Area',
      rtspUrl: 'rtsp://demo:demo@192.168.1.103/stream1',
      isActive: false,
      status: 'offline',
      location: 'Building A - Ground Floor'
    },
    {
      id: 'cam-4',
      name: 'Conference Room',
      rtspUrl: 'rtsp://demo:demo@192.168.1.104/stream1',
      isActive: true,
      status: 'online',
      location: 'Building A - 2nd Floor'
    }
  ]);

  const toggleCamera = (cameraId: string) => {
    setCameras(prev => prev.map(camera => 
      camera.id === cameraId 
        ? { ...camera, isActive: !camera.isActive }
        : camera
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Camera Dashboard</h1>
          <p className="text-gray-600">Real-time monitoring of all camera feeds</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {cameras.filter(c => c.isActive).length} of {cameras.length} cameras active
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Camera className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Cameras</p>
              <p className="text-2xl font-bold text-gray-900">{cameras.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Wifi className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Online</p>
              <p className="text-2xl font-bold text-gray-900">
                {cameras.filter(c => c.status === 'online').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Recent Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Avg FPS</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(cameraStats).length > 0 
                  ? Math.round(Object.values(cameraStats).reduce((acc, stats) => acc + stats.fps, 0) / Object.values(cameraStats).length)
                  : '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
        {cameras.map((camera) => {
          const stats = cameraStats[camera.id];
          
          return (
            <div key={camera.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Camera Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{camera.name}</h3>
                    <p className="text-sm text-gray-500">{camera.location}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      camera.status === 'online' 
                        ? 'bg-green-100 text-green-800' 
                        : camera.status === 'offline'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {camera.status}
                    </span>
                    
                    <button
                      onClick={() => toggleCamera(camera.id)}
                      className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                        camera.isActive
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      } transition-colors`}
                    >
                      {camera.isActive ? (
                        <>
                          <Pause className="h-3 w-3 mr-1" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 mr-1" />
                          Start
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Video Feed */}
              <div className="relative bg-gray-900 aspect-video">
                {camera.isActive && camera.status === 'online' ? (
                  <div className="w-full h-full flex items-center justify-center">
                    {/* Mock video feed - in real app, this would be WebRTC video element */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900 opacity-80"></div>
                    <div className="relative z-10 text-center text-white">
                      <Camera className="h-12 w-12 mx-auto mb-2 opacity-60" />
                      <p className="text-sm">Live Feed</p>
                      <p className="text-xs opacity-60">{camera.name}</p>
                    </div>
                    
                    {/* Video Overlay */}
                    <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                      {stats ? `${stats.fps} FPS` : 'Loading...'}
                    </div>
                    
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                      {new Date().toLocaleTimeString()}
                    </div>
                    
                    {/* Mock face detection box */}
                    {Math.random() > 0.7 && (
                      <div className="absolute top-1/3 left-1/3 w-16 h-20 border-2 border-green-400 bg-green-400 bg-opacity-10">
                        <div className="absolute -top-5 left-0 text-green-400 text-xs bg-black bg-opacity-70 px-1 rounded">
                          Face 87%
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Camera className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">
                        {camera.isActive ? 'Connecting...' : 'Camera Offline'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Stats */}
              {stats && camera.isActive && (
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-gray-500">FPS</p>
                      <p className="font-medium text-gray-900">{stats.fps}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500">Bitrate</p>
                      <p className="font-medium text-gray-900">{stats.bitrate} kbps</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500">Status</p>
                      <p className={`font-medium ${stats.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Alerts</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {alerts.length > 0 ? (
            alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-orange-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                      <p className="text-sm text-gray-500">
                        {alert.cameraName} • {alert.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {alert.confidence && (
                    <span className="text-sm text-gray-500">
                      {Math.round(alert.confidence * 100)}% confidence
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>No recent alerts</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;