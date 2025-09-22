import React, { useState } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { AlertCircle, Filter, Trash2, Eye, Calendar, Camera } from 'lucide-react';

const AlertsPage: React.FC = () => {
  const { alerts, clearAlerts } = useWebSocket();
  const [filterType, setFilterType] = useState<'all' | 'face_detected' | 'camera_offline' | 'stream_error'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'camera'>('newest');

  const filteredAlerts = alerts
    .filter(alert => filterType === 'all' || alert.type === filterType)
    .sort((a, b) => {
      if (sortBy === 'newest') return b.timestamp.getTime() - a.timestamp.getTime();
      if (sortBy === 'oldest') return a.timestamp.getTime() - b.timestamp.getTime();
      if (sortBy === 'camera') return a.cameraName.localeCompare(b.cameraName);
      return 0;
    });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'face_detected':
        return <Eye className="h-5 w-5 text-blue-500" />;
      case 'camera_offline':
        return <Camera className="h-5 w-5 text-red-500" />;
      case 'stream_error':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'face_detected':
        return 'bg-blue-50 border-blue-200';
      case 'camera_offline':
        return 'bg-red-50 border-red-200';
      case 'stream_error':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatAlertType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts & Events</h1>
          <p className="text-gray-600">Monitor all system alerts and face detection events</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={clearAlerts}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            disabled={alerts.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-gray-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Face Detections</p>
              <p className="text-2xl font-bold text-gray-900">
                {alerts.filter(a => a.type === 'face_detected').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Camera className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Camera Issues</p>
              <p className="text-2xl font-bold text-gray-900">
                {alerts.filter(a => a.type === 'camera_offline').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {alerts.filter(a => 
                  a.timestamp.toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Filter className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="face_detected">Face Detected</option>
              <option value="camera_offline">Camera Offline</option>
              <option value="stream_error">Stream Error</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="camera">Camera Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {filteredAlerts.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-6 border-l-4 ${getAlertColor(alert.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getAlertIcon(alert.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {formatAlertType(alert.type)}
                        </h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {alert.cameraName}
                        </span>
                      </div>
                      
                      <p className="mt-1 text-sm text-gray-600">{alert.message}</p>
                      
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span>{alert.timestamp.toLocaleString()}</span>
                        {alert.confidence && (
                          <span>Confidence: {Math.round(alert.confidence * 100)}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
            <p className="text-gray-500">
              {filterType === 'all' 
                ? 'No alerts have been generated yet.' 
                : `No ${formatAlertType(filterType).toLowerCase()} alerts found.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Pagination placeholder */}
      {filteredAlerts.length > 10 && (
        <div className="bg-white px-4 py-3 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to{' '}
              <span className="font-medium">{Math.min(10, filteredAlerts.length)}</span> of{' '}
              <span className="font-medium">{filteredAlerts.length}</span> results
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPage;