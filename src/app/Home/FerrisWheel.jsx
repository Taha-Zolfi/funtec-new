import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { api } from '@/lib/api';

const CABIN_COUNT = 10;

function FerrisWheel() {
  const groupRef = useRef();
  const cylinderRef = useRef();
  const { camera, gl } = useThree();
  const { scene } = useGLTF('/scene2.glb');
  const [cabinData, setCabinData] = useState([]);

  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const inverseQuat = useMemo(() => new THREE.Quaternion(), []);
  const textureLoader = useMemo(() => new THREE.TextureLoader(), []);
  const textureCache = useMemo(() => new Map(), []);

  useEffect(() => {
    const fetchCabinData = async () => {
      try {
        const data = await api.getCabins();
        setCabinData(data);
      } catch (error) {
        console.error("Failed to fetch cabin data:", error);
        const emptyData = Array.from({ length: CABIN_COUNT }, (_, i) => ({
          id: i + 1,
          cabin_number: i + 1,
          image_url: '/placeholder.webp',
          target_link: '/'
        }));
        setCabinData(emptyData);
      }
    };
    fetchCabinData();
  }, []);

  const loadTexture = useCallback((path) => {
    if (!path) return null;
    
    // اگر مسیر یک URL کامل نیست، آن را کامل می‌کنیم.
    const fullUrl = path.startsWith('http') ? path : `${window.location.origin}${path}`;

    if (textureCache.has(fullUrl)) {
      return textureCache.get(fullUrl);
    }
    const texture = textureLoader.load(fullUrl);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.repeat.x = -1;
    texture.offset.x = 1;
    textureCache.set(fullUrl, texture);
    return texture;
  }, [textureLoader, textureCache]);
  
  const updateMouseCoords = useCallback((event) => {
    if (!gl.domElement) return;
    const rect = gl.domElement.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }, [gl]);

  const checkIntersection = useCallback((event) => {
    if (!groupRef.current) return null;
    updateMouseCoords(event);
    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObject(groupRef.current, true);
    const firstHitWithLink = intersects.find(hit => hit.object.userData.link && hit.object.userData.link !== '/');
    return firstHitWithLink || null;
  }, [camera, updateMouseCoords]);

  const handleClick = useCallback((event) => {
    const hit = checkIntersection(event);
    if (hit && hit.object.userData.link) {
      window.location.href = hit.object.userData.link;
    }
  }, [checkIntersection]);

  const handlePointerMove = useCallback((event) => {
    const hit = checkIntersection(event);
    if (gl.domElement) {
      gl.domElement.style.cursor = hit ? 'pointer' : 'default';
    }
  }, [gl, checkIntersection]);

  const throttledPointerMove = useMemo(() => {
    let ticking = false;
    return (event) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handlePointerMove(event);
          ticking = false;
        });
        ticking = true;
      }
    };
  }, [handlePointerMove]);

  useEffect(() => {
    if (!scene || !groupRef.current || cabinData.length === 0) return;
    
    cylinderRef.current = groupRef.current.getObjectByName('Cylinder');

    cabinData.forEach(cabin => {
      const index = cabin.cabin_number.toString().padStart(3, '0');
      const plane = groupRef.current.getObjectByName(`Plane${index}`);
      
      if (plane) {
        plane.userData.link = cabin.target_link;
        const texture = loadTexture(cabin.image_url);
        
        if (texture) {
            plane.material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.FrontSide });
            plane.material.needsUpdate = true;
        } else {
            plane.material.visible = false;
        }
        plane.rotation.y = Math.PI;
      }
    });
    
    return () => {
      textureCache.forEach(texture => texture.dispose());
      textureCache.clear();
    };
  }, [scene, cabinData, loadTexture]);

  useEffect(() => {
    const canvasElement = gl.domElement;
    if (!canvasElement) return;
    canvasElement.addEventListener('click', handleClick);
    canvasElement.addEventListener('pointermove', throttledPointerMove);
    return () => {
      canvasElement.removeEventListener('click', handleClick);
      canvasElement.removeEventListener('pointermove', throttledPointerMove);
      if (gl.domElement) gl.domElement.style.cursor = 'default';
    };
  }, [gl, handleClick, throttledPointerMove]);

  useFrame(() => {
    const cylinder = cylinderRef.current;
    if (!cylinder) return;
    cylinder.rotation.y -= 0.003;

    cylinder.getWorldQuaternion(inverseQuat);
    inverseQuat.invert();

    for (let i = 1; i <= CABIN_COUNT; i++) {
      const index = i.toString().padStart(3, '0');
      const cabin = cylinder.getObjectByName(`v${index}`);
      if (cabin) {
        cabin.quaternion.copy(inverseQuat);
      }
    }
  });

  return <primitive object={scene} ref={groupRef} position={[-1.2, 0.1, 0]} />;
}

useGLTF.preload('/scene2.glb');

export default FerrisWheel;