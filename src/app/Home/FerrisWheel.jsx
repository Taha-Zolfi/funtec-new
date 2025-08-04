import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const CABIN_COUNT = 10;

function FerrisWheel() {
  const groupRef = useRef();
  const cylinderRef = useRef();
  const cabins = useRef([]);
  const planeMeshes = useRef([]);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const { camera, gl } = useThree();

  const { scene } = useGLTF('/ferris_final.glb');

  const inverseQuat = useMemo(() => new THREE.Quaternion(), []);
  const textureLoader = useMemo(() => new THREE.TextureLoader(), []);
  const links = useMemo(() => Array(CABIN_COUNT).fill('/products/'), []);
  const textureCache = useMemo(() => new Map(), []);

const materialConfig = useMemo(() => Object.freeze({
  transparent: false,
  opacity: 1,
  depthTest: true,
  depthWrite: true,
  side: THREE.DoubleSide,
}), []);

const loadTexture = useCallback((path) => {
  let cached = textureCache.get(path);
  if (cached) return cached;
  const texture = textureLoader.load(
    path,
    undefined,
    undefined,
    (error) => console.warn(`Failed to load texture ${path}:`, error)
  );
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.repeat.x = -1;
  texture.offset.x = 1;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  textureCache.set(path, texture);
  return texture;
}, [textureLoader, textureCache]);

  const updateMouseCoords = useCallback((event) => {
    if (!gl.domElement) return false;
    const rect = gl.domElement.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    return true;
  }, [gl]);

  const handleClick = useCallback((event) => {
    if (!updateMouseCoords(event) || planeMeshes.current.length === 0) return;
    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObjects(planeMeshes.current, false);
    if (intersects.length > 0) {
      const url = intersects[0].object.userData.link;
      if (url) window.location.href = url;
    }
  }, [camera, updateMouseCoords]);

  const handlePointerMove = useCallback((event) => {
    if (!updateMouseCoords(event) || planeMeshes.current.length === 0) return;
    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObjects(planeMeshes.current, false);
    if (gl.domElement) {
      gl.domElement.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
    }
  }, [camera, gl, updateMouseCoords]);

  // Throttle pointer move using requestAnimationFrame for better performance
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
    if (!scene || !groupRef.current) return;
    cylinderRef.current = groupRef.current.getObjectByName('Cylinder');
    cabins.current = [];
    planeMeshes.current = [];
    for (let i = 1; i <= CABIN_COUNT; i++) {
      const index = i.toString().padStart(3, '0');
      const cabin = groupRef.current.getObjectByName(`v${index}`);
      if (cabin) {
        cabin.frustumCulled = true;
        cabins.current.push(cabin);
      }
      const plane = groupRef.current.getObjectByName(`Plane${index}`);
      if (plane) {
        // Only set material if not already set (prevents unnecessary re-creation)
        if (!plane.material.map) {
          const texture = loadTexture(`/p${i}-min.webp`);
          plane.material = new THREE.MeshBasicMaterial({
            ...materialConfig,
            map: texture,
          });
        }
        plane.rotation.y = Math.PI;
        plane.userData.link = links[i - 1];
        plane.frustumCulled = true;
        planeMeshes.current.push(plane);
      }
    }
    return () => {
      textureCache.forEach(texture => texture.dispose());
      textureCache.clear();
    };
  }, [scene, loadTexture, links, materialConfig]);

  useEffect(() => {
    const element = gl.domElement;
    if (!element) return;

    element.addEventListener('click', handleClick, { passive: true });
    element.addEventListener('pointermove', throttledPointerMove, { passive: true });

    return () => {
      element.removeEventListener('click', handleClick);
      element.removeEventListener('pointermove', throttledPointerMove);
    };
  }, [handleClick, throttledPointerMove, gl]);

  useFrame(() => {
    const cylinder = cylinderRef.current;
    if (!cylinder) return;

    cylinder.rotation.y -= 0.003;

    if (cabins.current.length > 0) {
      // این منطق باعث می‌شود کابین‌ها نسبت به چرخش چرخ و فلک ثابت بمانند
      cylinder.getWorldQuaternion(inverseQuat);
      inverseQuat.invert();

      for (let i = 0; i < cabins.current.length; i++) {
        const cabin = cabins.current[i];
        if (cabin) {
          cabin.quaternion.copy(inverseQuat);
        }
      }
    }
  });

  return <primitive object={scene} ref={groupRef} position={[-1.2, 0.1, 0]} />;
}

useGLTF.preload('/ferris_final.glb');

export default FerrisWheel;