import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

/**
 * An enhanced 3D model viewer component using Three.js
 */
const EnhancedModelViewer = ({ modelUrl, format, vrCompatible, className, style }) => {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Clean up Three.js resources
  const cleanupThree = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (rendererRef.current) {
      rendererRef.current.dispose();
      
      // Also dispose of any materials/geometries in the scene
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object.isMesh) {
            if (object.geometry) object.geometry.dispose();
            
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
              } else {
                object.material.dispose();
              }
            }
          }
        });
      }
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    
    if (!modelUrl) {
      setError('No model URL provided');
      setLoading(false);
      return;
    }
    
    // Initialize Three.js scene
    const initThree = () => {
      // Create scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1a202c);
      sceneRef.current = scene;
      
      // Create camera
      const camera = new THREE.PerspectiveCamera(
        75, 
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.z = 5;
      cameraRef.current = camera;
      
      // Create renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      rendererRef.current = renderer;
      
      // Clean container before adding renderer
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      
      containerRef.current.appendChild(renderer.domElement);
      
      // Add lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(0, 5, 10);
      scene.add(directionalLight);
      
      // Add controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 2;
      controls.maxDistance = 20;
      controlsRef.current = controls;
      
      // Add grid for orientation
      const gridHelper = new THREE.GridHelper(10, 10, 0x555555, 0x333333);
      scene.add(gridHelper);
      
      // Animation loop
      const animate = () => {
        if (!rendererRef.current) return;
        
        animationFrameRef.current = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      
      animate();
      
      // Handle window resize
      const handleResize = () => {
        if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
        
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        cleanupThree();
      };
    };
    
    // Load 3D model based on format
    const loadModel = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Initialize Three.js scene
        const cleanup = initThree();
        
        // Select loader based on format
        let loader;
        switch (format?.toLowerCase()) {
          case 'gltf':
          case 'glb':
            loader = new GLTFLoader();
            break;
          case 'obj':
            loader = new OBJLoader();
            break;
          case 'fbx':
            loader = new FBXLoader();
            break;
          default:
            // Default to GLTF for unknown formats
            loader = new GLTFLoader();
        }
        
        // Load model
        loader.load(
          modelUrl,
          (result) => {
            let modelObject;
            
            // Handle different formats
            if (format?.toLowerCase() === 'gltf' || format?.toLowerCase() === 'glb') {
              modelObject = result.scene;
            } else {
              modelObject = result;
            }
            
            // Center model and scale to fit view
            const box = new THREE.Box3().setFromObject(modelObject);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            // Center model
            modelObject.position.x -= center.x;
            modelObject.position.y -= center.y;
            modelObject.position.z -= center.z;
            
            // Scale model to reasonable size
            const maxDim = Math.max(size.x, size.y, size.z);
            if (maxDim > 0) {
              const scale = 3 / maxDim;
              modelObject.scale.set(scale, scale, scale);
            }
            
            // Add model to scene
            sceneRef.current.add(modelObject);
            
            // Update camera position based on model size
            cameraRef.current.position.z = Math.max(size.z * 2, 5);
            
            // Set controls target to center of model
            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.update();
            
            setLoading(false);
          },
          (progress) => {
            // Handle loading progress
            console.log(`Loading: ${Math.round((progress.loaded / progress.total) * 100)}%`);
          },
          (err) => {
            console.error('Error loading 3D model:', err);
            setError(`Failed to load model: ${err.message || 'Unknown error'}`);
            setLoading(false);
          }
        );
        
        return cleanup;
      } catch (err) {
        console.error('Error loading 3D model:', err);
        setError(`Failed to load model: ${err.message || 'Unknown error'}`);
        setLoading(false);
      }
    };
    
    loadModel();
    
    return () => {
      cleanupThree();
    };
  }, [modelUrl, format]);

  return (
    <div 
      ref={containerRef} 
      className={`model-viewer ${className || ''}`}
      style={{ 
        position: 'relative', 
        aspectRatio: '1/1', 
        backgroundColor: '#1a202c',
        ...style
      }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center flex-col text-center p-4 bg-black/70">
          <div className="text-red-400 text-lg mb-2">⚠️</div>
          <div className="text-red-400">{error}</div>
        </div>
      )}
      
      {vrCompatible && !loading && !error && (
        <div className="absolute top-2 right-2 bg-blue-500/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
          VR
        </div>
      )}

      {/* Instructions overlay */}
      {!loading && !error && (
        <div className="absolute bottom-2 left-2 right-2 text-center text-xs bg-black/50 text-white py-1 px-2 rounded backdrop-blur-sm opacity-70 hover:opacity-100 transition-opacity">
          拖动：旋转 | 滚轮：缩放 | Shift+拖动：平移
        </div>
      )}
    </div>
  );
};

export default EnhancedModelViewer; 