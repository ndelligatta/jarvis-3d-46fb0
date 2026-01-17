import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import { OrbitControls, Stars } from '@react-three/drei'
import { Suspense, useState, useEffect, useCallback, useRef } from 'react'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import JarvisCore from './components/JarvisCore'
import CodeGeneration from './components/CodeGeneration'
import TextInterface from './components/TextInterface'

// Camera angle tracker component
function CameraTracker({ onAngleChange }) {
  const { camera } = useThree()

  useFrame(() => {
    const spherical = new THREE.Spherical()
    spherical.setFromVector3(camera.position)
    const azimuth = THREE.MathUtils.radToDeg(spherical.theta)
    const polar = THREE.MathUtils.radToDeg(spherical.phi)
    const distance = spherical.radius

    onAngleChange({
      azimuth: azimuth.toFixed(1),
      polar: polar.toFixed(1),
      distance: distance.toFixed(2)
    })
  })

  return null
}

function App() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [displayText, setDisplayText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [mode, setMode] = useState('idle')
  const [cameraAngles, setCameraAngles] = useState({ azimuth: '0', polar: '90', distance: '5' })
  const [inputValue, setInputValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [hasGreeted, setHasGreeted] = useState(false)
  const inputRef = useRef(null)

  // Show/hide input based on state - only after initial greeting
  const inputVisible = hasGreeted && !isSpeaking && !isProcessing && !isGenerating

  // Typewriter effect
  const speak = useCallback((text) => {
    return new Promise((resolve) => {
      setDisplayText('')
      setIsSpeaking(true)
      setMode('speaking')

      let index = 0
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1))
          index++
        } else {
          clearInterval(interval)
          setTimeout(() => {
            setIsSpeaking(false)
            setMode('idle')
            resolve()
          }, 300)
        }
      }, 25)
    })
  }, [])

  // Code generation sequence
  const runCodeGeneration = useCallback(async () => {
    setIsGenerating(true)
    setMode('generating')
    setProgress(0)

    // Start progress animation
    const progressInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 1) {
          clearInterval(progressInterval)
          return 1
        }
        return p + 0.008
      })
    }, 100)

    // Speak while generating
    await speak("Analyzing requirements... Identifying optimal architecture patterns.")
    await new Promise(r => setTimeout(r, 500))
    await speak("Initiating code generation sequence. Deploying holographic workspace.")
    await new Promise(r => setTimeout(r, 500))
    await speak("Generating modules... Creating React components... Implementing API integration...")
    await new Promise(r => setTimeout(r, 6000))
    await speak("Building type definitions... Optimizing bundle structure...")
    await new Promise(r => setTimeout(r, 4000))

    // Stop generating
    clearInterval(progressInterval)
    setProgress(1)
    await speak("Code generation complete. All modules compiled successfully. System ready for deployment.")

    await new Promise(r => setTimeout(r, 1000))
    setIsGenerating(false)
    setMode('idle')
    setProgress(0)
  }, [speak])

  // Handle user input
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isProcessing || isSpeaking) return

    const userMessage = inputValue.trim().toLowerCase()
    setInputValue('')
    setIsProcessing(true)

    // Check for code generation triggers
    const codeKeywords = ['build', 'create', 'generate', 'code', 'make', 'develop', 'write']
    const shouldGenerateCode = codeKeywords.some(keyword => userMessage.includes(keyword))

    if (shouldGenerateCode) {
      await speak(`Prompt received: "${inputValue.trim()}"`)
      await new Promise(r => setTimeout(r, 500))
      await runCodeGeneration()
    } else if (userMessage.includes('hello') || userMessage.includes('hi') || userMessage.includes('hey')) {
      await speak("Good evening, sir. JARVIS online and ready. How may I assist you today?")
    } else if (userMessage.includes('status') || userMessage.includes('system')) {
      await speak("All systems operational. Core processors running at optimal efficiency. Network connectivity stable. Ready for your commands, sir.")
    } else if (userMessage.includes('help')) {
      await speak("I can assist with code generation, system analysis, and various technical tasks. Simply describe what you'd like me to build or analyze.")
    } else if (userMessage.includes('thank')) {
      await speak("You're welcome, sir. Always at your service.")
    } else {
      // Default response
      await speak(`Understood, sir. Processing your request: "${inputValue.trim()}". How would you like me to proceed?`)
    }

    setIsProcessing(false)
    inputRef.current?.focus()
  }, [inputValue, isProcessing, isSpeaking, speak, runCodeGeneration])

  // Initial greeting on load
  useEffect(() => {
    const greet = async () => {
      await new Promise(r => setTimeout(r, 1000))
      await speak("Good evening, sir. JARVIS online and ready. How may I assist you today?")
      setHasGreeted(true)
    }
    greet()
  }, [speak])

  // Animate input visibility
  useEffect(() => {
    if (inputVisible) {
      // Small delay before showing input for smooth transition
      const timer = setTimeout(() => {
        setShowInput(true)
        // Focus input after animation
        setTimeout(() => inputRef.current?.focus(), 300)
      }, 200)
      return () => clearTimeout(timer)
    } else {
      setShowInput(false)
    }
  }, [inputVisible])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} dpr={[1, 2]}>
        <color attach="background" args={['#000004']} />
        <fog attach="fog" args={['#000008', 8, 25]} />

        <Stars
          radius={50}
          depth={50}
          count={1500}
          factor={3}
          saturation={0}
          fade
          speed={isGenerating ? 2 : 0.5}
        />

        <Suspense fallback={null}>
          <JarvisCore isSpeaking={isSpeaking} isGenerating={isGenerating} />
          <CodeGeneration isGenerating={isGenerating} progress={progress} />
        </Suspense>

        <CameraTracker onAngleChange={setCameraAngles} />

        <EffectComposer>
          <Bloom
            intensity={isGenerating ? 2.5 : 2}
            luminanceThreshold={0.05}
            luminanceSmoothing={0.9}
            radius={0.9}
          />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={isGenerating ? [0.001, 0.001] : [0.0005, 0.0005]}
          />
          <Vignette
            offset={0.3}
            darkness={isGenerating ? 0.5 : 0.6}
            blendFunction={BlendFunction.NORMAL}
          />
        </EffectComposer>

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={12}
          autoRotate
          autoRotateSpeed={isGenerating ? 0.5 : 0.2}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>

      <TextInterface
        text={displayText}
        isSpeaking={isSpeaking}
        isGenerating={isGenerating}
        progress={progress}
        inputVisible={showInput}
      />

      {/* Input textbox with zoom animation */}
      <form onSubmit={handleSubmit} style={{
        position: 'absolute',
        bottom: '180px',
        left: '50%',
        transform: `translateX(-50%) scale(${showInput ? 1 : 0.8})`,
        width: '80%',
        maxWidth: '700px',
        zIndex: 200,
        opacity: showInput ? 1 : 0,
        transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease-out',
        pointerEvents: showInput ? 'auto' : 'none',
      }}>
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
        }}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isProcessing ? "Processing..." : "Type a message to JARVIS..."}
            disabled={isProcessing || isSpeaking}
            style={{
              flex: 1,
              padding: '15px 20px',
              background: 'rgba(0, 20, 40, 0.9)',
              border: '1px solid rgba(0, 212, 255, 0.4)',
              borderRadius: '4px',
              color: '#e0f7ff',
              fontFamily: "'Rajdhani', 'Roboto Mono', monospace",
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              boxShadow: '0 0 20px rgba(0, 212, 255, 0.1), inset 0 0 20px rgba(0, 212, 255, 0.05)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(0, 212, 255, 0.8)'
              e.target.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.2), inset 0 0 20px rgba(0, 212, 255, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(0, 212, 255, 0.4)'
              e.target.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.1), inset 0 0 20px rgba(0, 212, 255, 0.05)'
            }}
          />
          <button
            type="submit"
            disabled={isProcessing || isSpeaking || !inputValue.trim()}
            style={{
              padding: '15px 25px',
              background: isProcessing || isSpeaking ? 'rgba(0, 212, 255, 0.2)' : 'rgba(0, 212, 255, 0.3)',
              border: '1px solid rgba(0, 212, 255, 0.5)',
              borderRadius: '4px',
              color: '#00d4ff',
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '14px',
              letterSpacing: '2px',
              cursor: isProcessing || isSpeaking ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              textShadow: '0 0 10px #00d4ff',
              boxShadow: '0 0 15px rgba(0, 212, 255, 0.2)',
            }}
            onMouseEnter={(e) => {
              if (!isProcessing && !isSpeaking) {
                e.target.style.background = 'rgba(0, 212, 255, 0.4)'
                e.target.style.boxShadow = '0 0 25px rgba(0, 212, 255, 0.4)'
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.background = isProcessing || isSpeaking ? 'rgba(0, 212, 255, 0.2)' : 'rgba(0, 212, 255, 0.3)'
              e.target.style.boxShadow = '0 0 15px rgba(0, 212, 255, 0.2)'
            }}
          >
            SEND
          </button>
        </div>
      </form>

      {/* Scanline overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.03) 2px, rgba(0, 0, 0, 0.03) 4px)',
        zIndex: 100,
      }} />

      {/* Debug camera angle label */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        padding: '12px 16px',
        background: 'rgba(0, 0, 0, 0.8)',
        border: '1px solid rgba(255, 100, 0, 0.5)',
        borderRadius: '4px',
        fontFamily: "'Roboto Mono', monospace",
        fontSize: '12px',
        color: '#ff6600',
        zIndex: 300,
        textShadow: '0 0 5px #ff6600',
        pointerEvents: 'none',
      }}>
        <div style={{ marginBottom: '4px', color: '#ff9944', fontSize: '10px', letterSpacing: '2px' }}>DEBUG</div>
        <div>AZIMUTH: <span style={{ color: '#00ffaa' }}>{cameraAngles.azimuth}°</span></div>
        <div>POLAR: <span style={{ color: '#00ffaa' }}>{cameraAngles.polar}°</span></div>
        <div>DISTANCE: <span style={{ color: '#00ffaa' }}>{cameraAngles.distance}</span></div>
      </div>

      {/* Code generation indicator */}
      {isGenerating && (
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          padding: '10px 25px',
          background: 'rgba(0, 255, 136, 0.1)',
          border: '1px solid rgba(0, 255, 136, 0.3)',
          borderRadius: '4px',
          zIndex: 200,
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#00ff88',
            boxShadow: '0 0 15px #00ff88',
            animation: 'pulse 0.5s ease-in-out infinite',
          }} />
          <span style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '14px',
            color: '#00ff88',
            letterSpacing: '3px',
            textShadow: '0 0 10px #00ff88',
          }}>
            GENERATING CODE
          </span>
          <span style={{
            fontFamily: "'Roboto Mono', monospace",
            fontSize: '14px',
            color: '#00ff88',
          }}>
            {Math.floor(progress * 100)}%
          </span>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }

        input::placeholder {
          color: rgba(0, 212, 255, 0.4);
        }
      `}</style>
    </div>
  )
}

export default App
