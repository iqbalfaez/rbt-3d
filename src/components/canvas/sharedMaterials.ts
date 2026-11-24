import * as THREE from 'three';

/**
 * Shared geometries & materials for Chromebook / low-spec GPU performance.
 * Reusing geometries across repeated pins, headers, and hardware parts
 * dramatically reduces draw memory and avoids leak spikes on mission reset.
 */
export const SHARED_GEO = {
  pinPost: new THREE.CylinderGeometry(0.085, 0.085, 0.34, 10),
  pinBase: new THREE.BoxGeometry(0.28, 0.14, 0.28),
  pinRing: new THREE.TorusGeometry(0.18, 0.035, 8, 18),
  ledSmall: new THREE.SphereGeometry(0.11, 10, 10),
  breadboardHole: new THREE.BoxGeometry(0.16, 0.04, 0.16),
  pulseBead: new THREE.SphereGeometry(0.13, 10, 10),
  waterDroplet: new THREE.SphereGeometry(0.1, 8, 8),
  sparkParticle: new THREE.OctahedronGeometry(0.11, 0),
};

export const SHARED_MAT = {
  pinGold: new THREE.MeshStandardMaterial({
    color: '#d9a441',
    metalness: 0.85,
    roughness: 0.25,
  }),
  pinShroud: new THREE.MeshStandardMaterial({
    color: '#1e242b',
    roughness: 0.75,
    metalness: 0.1,
  }),
  pinRingHover: new THREE.MeshBasicMaterial({ color: '#fbbf24' }),
  pinRingActive: new THREE.MeshBasicMaterial({ color: '#38bdf8' }),
  pinRingProbeA: new THREE.MeshBasicMaterial({ color: '#ef4444' }),
  pinRingProbeB: new THREE.MeshBasicMaterial({ color: '#0f172a' }),
  breadboardHole: new THREE.MeshStandardMaterial({
    color: '#1f2937',
    roughness: 0.9,
  }),
  metalSilver: new THREE.MeshStandardMaterial({
    color: '#cbd5e1',
    metalness: 0.82,
    roughness: 0.26,
  }),
  metalDark: new THREE.MeshStandardMaterial({
    color: '#334155',
    metalness: 0.65,
    roughness: 0.38,
  }),
  copper: new THREE.MeshStandardMaterial({
    color: '#c97a40',
    metalness: 0.82,
    roughness: 0.28,
  }),
  brassGear: new THREE.MeshStandardMaterial({
    color: '#d4a644',
    metalness: 0.78,
    roughness: 0.3,
  }),
  nylonGear: new THREE.MeshStandardMaterial({
    color: '#e2e8f0',
    roughness: 0.45,
    metalness: 0.08,
  }),
  icBlack: new THREE.MeshStandardMaterial({
    color: '#15191e',
    roughness: 0.55,
    metalness: 0.15,
  }),
  waterDrop: new THREE.MeshStandardMaterial({
    color: '#38bdf8',
    emissive: '#0284c7',
    emissiveIntensity: 0.35,
    roughness: 0.15,
    metalness: 0.1,
    transparent: true,
    opacity: 0.85,
  }),
};

export function createHousingMaterialProps(color: string, xray: boolean, roughness = 0.55, metalness = 0.12) {
  return {
    color,
    roughness,
    metalness,
    transparent: xray,
    opacity: xray ? 0.28 : 1,
    depthWrite: !xray,
  };
}
