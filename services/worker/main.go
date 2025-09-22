package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// Camera represents a camera configuration
type Camera struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	RTSPUrl  string `json:"rtsp_url"`
	IsActive bool   `json:"is_active"`
	Status   string `json:"status"`
}

// FaceDetection represents a detected face
type FaceDetection struct {
	CameraID   string      `json:"camera_id"`
	CameraName string      `json:"camera_name"`
	Confidence float64     `json:"confidence"`
	BoundingBox BoundingBox `json:"bounding_box"`
	Timestamp  string      `json:"timestamp"`
}

// BoundingBox represents face coordinates
type BoundingBox struct {
	X      int `json:"x"`
	Y      int `json:"y"`
	Width  int `json:"width"`
	Height int `json:"height"`
}

// StreamProcessor handles individual camera streams
type StreamProcessor struct {
	camera   Camera
	isActive bool
}

// ProcessingManager manages all active stream processors
type ProcessingManager struct {
	processors map[string]*StreamProcessor
}

func NewProcessingManager() *ProcessingManager {
	return &ProcessingManager{
		processors: make(map[string]*StreamProcessor),
	}
}

func (pm *ProcessingManager) StartStream(camera Camera) error {
	log.Printf("Starting stream processing for camera: %s (%s)", camera.Name, camera.ID)
	
	processor := &StreamProcessor{
		camera:   camera,
		isActive: true,
	}
	
	pm.processors[camera.ID] = processor
	
	// Start processing in goroutine
	go processor.processStream()
	
	return nil
}

func (pm *ProcessingManager) StopStream(cameraID string) error {
	log.Printf("Stopping stream processing for camera: %s", cameraID)
	
	if processor, exists := pm.processors[cameraID]; exists {
		processor.isActive = false
		delete(pm.processors, cameraID)
	}
	
	return nil
}

func (sp *StreamProcessor) processStream() {
	log.Printf("Processing stream for camera: %s", sp.camera.Name)
	
	// Mock stream processing with face detection
	// In real implementation:
	// 1. Connect to RTSP stream using FFmpeg
	// 2. Decode video frames
	// 3. Run OpenCV face detection on each frame
	// 4. Draw bounding boxes around detected faces
	// 5. Encode processed frames
	// 6. Stream to MediaMTX for WebRTC distribution
	// 7. Send detection events to backend API
	
	for sp.isActive {
		// Mock face detection processing
		// time.Sleep(time.Second * 2)
		
		// Simulate occasional face detection
		// if rand.Float64() > 0.7 {
		//     detection := FaceDetection{
		//         CameraID:   sp.camera.ID,
		//         CameraName: sp.camera.Name,
		//         Confidence: 0.7 + rand.Float64()*0.3, // 70-100%
		//         BoundingBox: BoundingBox{
		//             X:      rand.Intn(400),
		//             Y:      rand.Intn(300),
		//             Width:  80 + rand.Intn(40),
		//             Height: 100 + rand.Intn(50),
		//         },
		//         Timestamp: time.Now().Format(time.RFC3339),
		//     }
		//     
		//     // Send detection to backend API
		//     sendDetectionToBackend(detection)
		// }
	}
	
	log.Printf("Stopped processing stream for camera: %s", sp.camera.Name)
}

func sendDetectionToBackend(detection FaceDetection) {
	// In real implementation, make HTTP POST to backend API
	log.Printf("Face detected in %s with %.1f%% confidence", 
		detection.CameraName, detection.Confidence*100)
}

func main() {
	// Initialize Gin router
	r := gin.Default()
	
	// Initialize processing manager
	processingManager := NewProcessingManager()
	
	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "healthy",
			"service":   "rtc-camera-worker",
			"timestamp": "2024-01-20T12:00:00Z",
		})
	})
	
	// Start processing a camera stream
	r.POST("/cameras/:id/start", func(c *gin.Context) {
		cameraID := c.Param("id")
		
		var camera Camera
		if err := c.ShouldBindJSON(&camera); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		
		camera.ID = cameraID
		
		if err := processingManager.StartStream(camera); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		
		c.JSON(http.StatusOK, gin.H{
			"message": "Stream processing started",
			"camera":  camera,
		})
	})
	
	// Stop processing a camera stream
	r.POST("/cameras/:id/stop", func(c *gin.Context) {
		cameraID := c.Param("id")
		
		if err := processingManager.StopStream(cameraID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		
		c.JSON(http.StatusOK, gin.H{
			"message": "Stream processing stopped",
			"camera_id": cameraID,
		})
	})
	
	// Get processing status
	r.GET("/status", func(c *gin.Context) {
		activeStreams := make([]string, 0, len(processingManager.processors))
		for cameraID := range processingManager.processors {
			activeStreams = append(activeStreams, cameraID)
		}
		
		c.JSON(http.StatusOK, gin.H{
			"active_streams": activeStreams,
			"total_count":   len(activeStreams),
		})
	})
	
	// Get port from environment or default to 8081
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}
	
	log.Printf("🤖 Worker service starting on port %s", port)
	log.Printf("📊 Health check available at http://localhost:%s/health", port)
	log.Printf("🎥 Stream processing endpoints available")
	
	r.Run(":" + port)
}