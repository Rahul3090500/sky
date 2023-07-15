"use client";

import { useRef, useEffect, useState } from 'react'
import { useFrame, useThree, Canvas } from '@react-three/fiber'
import { easing } from 'maath'

import {
  useGLTF,
  Environment,
  Center,
  AccumulativeShadows,
  RandomizedLight,
  useTexture,
  Text,
  Decal
} from '@react-three/drei'
import { useSnapshot } from 'valtio'
import { state } from './store'

export const App = ({ position = [0, 0, 2.5], fov = 25 }) => {
  return (
    <Canvas
      style={{ height: '100vh', zIndex: 9 }}
      shadows
      gl={{ preserveDrawingBuffer: true }}
      camera={{ position, fov }}
      eventPrefix="client"
      className='canvas'
    >
      <ambientLight intensity={0.5} />
      <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/potsdamer_platz_1k.hdr" />

      <CameraRig>
        <Backdrop />
        <Center>
          <Shirt />
        </Center>
      </CameraRig>
    </Canvas>
  )
}

function Shirt(props) {
  const snap = useSnapshot(state);
  const shirtRef = useRef();
  const { viewport } = useThree();
  const { width } = viewport;
  const [isDragging, setDragging] = useState(false);
  const [prevMouseX, setPrevMouseX] = useState(0);
  const [prevMouseY, setPrevMouseY] = useState(0);

  const texture = useTexture(`/${snap.selectedDecal}.png`);
  const { nodes, materials } = useGLTF('/shirt_baked_collapsed.glb');

  const [name, setName] = useState(state.name || 'S K Y');

  const handleClick = () => {
    const newName = prompt('Enter a new name');
    if (newName) {
      state.name = newName;
      localStorage.setItem('shirtName', newName); // Save the name in local storage
      setName(newName); // Update the displayed name instantly
    }
  };

  const handleMouseDown = (event) => {
    setDragging(true);
    setPrevMouseX(event.clientX);
    setPrevMouseY(event.clientY);
  };

  const handleMouseMove = (event) => {
    if (!isDragging) return;

    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const deltaX = mouseX - prevMouseX;
    const deltaY = mouseY - prevMouseY;

    const rotationSpeed = 0.005; // Adjust the rotation speed as needed

    const shirt = shirtRef.current;
    if (shirt) {
      shirt.rotation.y += deltaX * rotationSpeed;
      shirt.rotation.x += deltaY * rotationSpeed;
    }

    setPrevMouseX(mouseX);
    setPrevMouseY(mouseY);
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    const savedName = localStorage.getItem('shirtName');
    if (savedName) {
      state.name = savedName; // Load the name from local storage
      setName(savedName); // Update the displayed name instantly
    }
  }, []);

  useFrame((state, delta) => {
    easing.dampC(materials.lambert1.color, snap.selectedColor, 0.25, delta);
    easing.dampE(
      shirtRef.current.rotation,
      [0, 0, 0],
      0.25,
      delta
    );
  });

  return (
    <mesh
      ref={shirtRef}
      castShadow
      geometry={nodes.T_Shirt_male.geometry}
      material={materials.lambert1}
      material-roughness={1}
      {...props}
      dispose={null}
      className="shirt"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Decal
        position={[0, 0.04, 0.15]}
        rotation={[0, 0, 0]}
        scale={0.15}
        opacity={0.7}
        map={texture}
      />
      <Text
        position={[0, 0.04, 0.15]}
        rotation={[0, 0, 0]}
        scale={0.18}
        color="black"
        fontSize={0.1}
        maxWidth={0.4}
        lineHeight={1}
        letterSpacing={0.02}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        depthOffset={-1}
        onClick={handleClick}
        onPointerOver={(e) => (e.intersections.length ? (document.body.style.cursor = 'pointer') : null)}
        onPointerOut={(e) => (document.body.style.cursor = 'auto')}
      >
        {name}
      </Text>
    </mesh>
  );
}

function Backdrop() {
  const shadows = useRef()

  useFrame((state, delta) =>
    easing.dampC(
      shadows.current.getMesh().material.color,
      state.selectedColor,
      0.25,
      delta
    )
  )

  return (
    <AccumulativeShadows
      ref={shadows}
      temporal
      frames={60}
      alphaTest={0.85}
      scale={10}
      rotation={[Math.PI / 2, 0, 0]}
      position={[0, 0, -0.14]}
    >
      <RandomizedLight
        amount={4}
        radius={9}
        intensity={0.55}
        ambient={0.25}
        position={[5, 5, -10]}
      />
      <RandomizedLight
        amount={4}
        radius={5}
        intensity={0.25}
        ambient={0.55}
        position={[-5, 5, -9]}
      />
    </AccumulativeShadows>
  )
}

function CameraRig({ children }) {
  const group = useRef();
  const { camera } = useThree();

  const snap = useSnapshot(state);

  const handleWheel = (event) => {
    const zoomAmount = event.deltaY * -0.01;
    const newFov = Math.max(Math.min(camera.fov + zoomAmount, 75), 5); // Adjust the min/max zoom levels as needed

    camera.fov = newFov;
    camera.updateProjectionMatrix();
  };

  useFrame((state, delta) => {
    easing.damp3(
      camera.position,
      [snap.intro ? -state.viewport.width / 4 : 0, 0, 2],
      0.25,
      delta
    );

    if (state.mouse.buttons === 1) {
      const { x, y } = state.mouse;
      camera.rotation.y -= x * 0.01;
      camera.rotation.x -= y * 0.01;
    }

    easing.dampE(
      group.current.rotation,
      [state.pointer.y / 10, -state.pointer.x / 5, 0],
      0.25,
      delta
    );
  });

  return (
    <group ref={group} onWheel={handleWheel}>
      {children}
    </group>
  );
}


useGLTF.preload('/shirt_baked_collapsed.glb')
