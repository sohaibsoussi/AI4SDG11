'use client'

import { Canvas, useFrame } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls, Html } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";

function Model({ audioStarted, audioPaused, audioDuration, position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const { nodes } = useLoader(GLTFLoader, "/marocmodel.glb");
  const blendshapeMeshRef = useRef(null);
  const startTime = useRef(null);
  const pauseTime = useRef(0);

  const meshes = Object.values(nodes).filter(node => node.isMesh);
  const blendshapeMesh = meshes.find(
    (mesh) => mesh.morphTargetDictionary && mesh.morphTargetDictionary["mouthOpen"] !== undefined
  );
 
  useEffect(() => {
    if (blendshapeMesh) {
      blendshapeMeshRef.current = blendshapeMesh;
    }
  }, [blendshapeMesh]);

  useFrame(({ clock }) => {
    if (blendshapeMeshRef.current && audioStarted && audioDuration > 0) {
      if (audioPaused) {
        pauseTime.current = clock.getElapsedTime() - startTime.current;

        return;
      }
      
      if (!startTime.current) startTime.current = clock.getElapsedTime() - pauseTime.current;
      
      const elapsed = clock.getElapsedTime() - startTime.current;
      const frequency = 3;
      const progress = (Math.sin(elapsed * frequency * Math.PI * 2) + 1) / 2;

      const mouthIndex = blendshapeMeshRef.current.morphTargetDictionary["mouthOpen"];
      if (mouthIndex !== undefined) {
        blendshapeMeshRef.current.morphTargetInfluences[mouthIndex] = progress;
      }
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {meshes.map((mesh, index) => (
        <primitive key={index} object={mesh} />
      ))}
    </group>
  );
}

export default function Scene() {
  const [audioStarted, setAudioStarted] = useState(false);
  const [audioPaused, setAudioPaused] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef(new Audio("/audio.mp3"));

  useEffect(() => {
    const audio = audioRef.current;
    audio.loop = false;

    audio.onloadedmetadata = () => {
      setAudioDuration(audio.duration);
    };

    return () => {
      audio.pause();
      audio.currentTime = 0;
      setAudioStarted(false);
      setAudioPaused(false);
    };
  }, []);

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audioStarted) {
      audio.play()
        .then(() => {
          setAudioStarted(true);
          setAudioPaused(false);
        })
        .catch((error) => console.warn("⚠️ Error playing audio:", error));
    } else if (audioPaused) {
      audio.play();
      setAudioPaused(false);
    } else {
      audio.pause();
      setAudioPaused(true);
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#222", position: "relative" }}>
      <Canvas camera={{ position: [2, 1, 2], fov: 50 }}>
        <ambientLight intensity={1} />
        <spotLight position={[10, 10, 10]} intensity={1.2} />
        <directionalLight position={[-5, 5, 5]} intensity={0.8} />
        
        <Model position={[.4, -1, 1.5]} rotation={[0, Math.PI / 4, 0]} audioStarted={audioStarted} audioPaused={audioPaused} audioDuration={audioDuration} />

        <OrbitControls enableZoom={true} enablePan={true} />

        {/* Button in 3D space, always in front of the camera */}
        <Html position={[-3, -2, -1]} center>
          <button
            onClick={toggleAudio}
            style={{
              padding: "12px 30px",
              fontSize: "18px",
              fontWeight: "bold",
              color: "#fff",
              background: "linear-gradient(145deg, #6a0dad, rgb(13, 218, 105))",
              border: "2px solid white",
              borderRadius: "50px",
              cursor: "pointer",
              boxShadow: `
                0 4px 8px rgba(0, 0, 0, 0.3),
                inset 0 2px 4px rgba(255, 255, 255, 0.2),
                inset 0 -2px 4px rgba(0, 0, 0, 0.2)
              `,
              transition: "all 0.3s ease",
            }}
          >
            {audioPaused || !audioStarted ? "▶ Play" : "⏸ Pause"}
          </button>
        </Html>
      </Canvas>
    </div>
  );
}
