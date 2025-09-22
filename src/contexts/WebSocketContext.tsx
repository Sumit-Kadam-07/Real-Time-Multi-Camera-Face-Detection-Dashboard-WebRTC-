import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface Alert {
  id: string;
  cameraId: string;
  cameraName: string;
  type: 'face_detected' | 'camera_offline' | 'stream_error';
  message: string;
  timestamp: Date;
  confidence?: number;
}

interface CameraStats {
  cameraId: string;
  fps: number;
  bitrate: number;
  isOnline: boolean;
  lastUpdate: Date;
}

interface WebSocketContextType {
  alerts: Alert[];
  cameraStats: Record<string, CameraStats>;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  addAlert: (alert: Alert) => void;
  clearAlerts: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [cameraStats, setCameraStats] = useState<Record<string, CameraStats>>({});
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  useEffect(() => {
    // Mock WebSocket connection - in real app, connect to backend WebSocket
    const mockConnection = () => {
      setConnectionStatus('connecting');
      
      setTimeout(() => {
        setConnectionStatus('connected');
        
        // Simulate periodic alerts and stats updates
        const interval = setInterval(() => {
          // Mock face detection alert
          if (Math.random() > 0.7) {
            const mockAlert: Alert = {
              id: Date.now().toString(),
              cameraId: `cam-${Math.floor(Math.random() * 4) + 1}`,
              cameraName: `Camera ${Math.floor(Math.random() * 4) + 1}`,
              type: 'face_detected',
              message: 'Face detected in camera feed',
              timestamp: new Date(),
              confidence: Math.random() * 0.4 + 0.6 // 60-100%
            };
            
            setAlerts(prev => [mockAlert, ...prev.slice(0, 9)]); // Keep last 10 alerts
          }

          // Mock camera stats updates
          ['cam-1', 'cam-2', 'cam-3', 'cam-4'].forEach(cameraId => {
            setCameraStats(prev => ({
              ...prev,
              [cameraId]: {
                cameraId,
                fps: Math.floor(Math.random() * 5) + 25, // 25-30 fps
                bitrate: Math.floor(Math.random() * 1000) + 2000, // 2000-3000 kbps
                isOnline: Math.random() > 0.1, // 90% uptime
                lastUpdate: new Date()
              }
            }));
          });
        }, 3000);

        return () => clearInterval(interval);
      }, 1000);
    };

    mockConnection();
  }, []);

  const addAlert = (alert: Alert) => {
    setAlerts(prev => [alert, ...prev.slice(0, 9)]);
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  return (
    <WebSocketContext.Provider value={{
      alerts,
      cameraStats,
      connectionStatus,
      addAlert,
      clearAlerts
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};