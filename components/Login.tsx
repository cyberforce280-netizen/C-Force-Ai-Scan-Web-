import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, Lock, User, Key, AlertTriangle, 
  Activity, ScanFace, Camera, UserPlus, ArrowLeft, CheckCircle, Cpu, Zap, Crosshair
} from 'lucide-react';
import { authService, UserData } from '../services/authService';

interface LoginProps {
  onLogin: (userData: { name: string; role: string; level: string }) => void;
}

type AuthMode = 'LOGIN' | 'REGISTER';
type LoginMethod = 'PASSWORD' | 'FACE';
type ScanStatus = 'IDLE' | 'SEEKING' | 'LOCKED' | 'SCANNING' | 'SUCCESS' | 'ERROR';

// --- BACKGROUND: Binary Rain & Network Canvas ---
const BinaryNetworkBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Binary Rain Config
    const fontSize = 14;
    const columns = width / fontSize;
    const drops: number[] = [];
    for (let x = 0; x < columns; x++) drops[x] = 1;

    // Network Nodes Config
    const nodes: {x: number, y: number, vx: number, vy: number}[] = [];
    const nodeCount = 30; // Fewer nodes to not clutter
    for(let i=0; i<nodeCount; i++) {
        nodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5
        });
    }

    const draw = () => {
      // Semi-transparent fade to create trails
      ctx.fillStyle = 'rgba(2, 6, 23, 0.1)'; 
      ctx.fillRect(0, 0, width, height);

      // 1. Draw Binary Rain
      ctx.fillStyle = '#0ea5e9'; // Sky Blue / Cyan
      ctx.font = `${fontSize}px monospace`;
      
      for (let i = 0; i < drops.length; i++) {
        const text = Math.random() > 0.5 ? '1' : '0';
        // Random opacity for glitch effect
        ctx.fillStyle = `rgba(14, 165, 233, ${Math.random() * 0.5 + 0.1})`; 
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      // 2. Draw Network Connections
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodeCount; i++) {
          let node = nodes[i];
          node.x += node.vx;
          node.y += node.vy;

          // Bounce
          if(node.x < 0 || node.x > width) node.vx *= -1;
          if(node.y < 0 || node.y > height) node.vy *= -1;

          // Draw Node
          ctx.beginPath();
          ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
          ctx.fill();

          // Connect
          for (let j = i + 1; j < nodeCount; j++) {
              let other = nodes[j];
              let dist = Math.hypot(node.x - other.x, node.y - other.y);
              if (dist < 150) {
                  ctx.beginPath();
                  ctx.strokeStyle = `rgba(56, 189, 248, ${0.2 - dist/750})`; // Fade with distance
                  ctx.moveTo(node.x, node.y);
                  ctx.lineTo(other.x, other.y);
                  ctx.stroke();
              }
          }
      }
    };

    const interval = setInterval(draw, 50);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-40" />;
};

// --- Full Face Mesh Net Component (With Dynamic Position) ---
const BiometricNetMask = ({ status, position }: { status: ScanStatus, position: { x: number, y: number } }) => {
  const color = status === 'SUCCESS' ? '#10b981' : '#ef4444'; // Green or Red
  const isLocked = status === 'LOCKED' || status === 'SCANNING' || status === 'SUCCESS';
  
  // Calculate subtle 3D tilt based on position
  const tiltX = -(position.y) * 15;
  const tiltY = (position.x) * 15;

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center overflow-visible transition-transform duration-100 ease-out will-change-transform"
      style={{
        transform: `translate(${position.x * 20}%, ${position.y * 20}%) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
        perspective: '1000px'
      }}
    >
      
      {/* 1. Seeking Animation (Crosshairs looking for face) */}
      {!isLocked && (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border border-blue-500/30 rounded-full animate-ping opacity-20 absolute"></div>
            <div className="w-48 h-48 border-2 border-dashed border-red-500/50 rounded-lg animate-[spin_3s_linear_infinite] opacity-50 absolute"></div>
            <Crosshair className="text-red-500 animate-pulse" size={32} />
            <span className="absolute mt-16 text-[10px] font-mono text-red-400 tracking-widest animate-pulse bg-black/50 px-2 rounded">TRACKING...</span>
        </div>
      )}

      {/* 2. Locked Grid Mask (The Face Net) */}
      <div className={`relative w-3/4 h-3/4 transition-all duration-500 ${isLocked ? 'scale-100 opacity-90' : 'scale-110 opacity-0'}`}>
        <svg viewBox="0 0 200 250" className="w-full h-full drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
          <defs>
            <linearGradient id="scanBeam" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0" />
              <stop offset="50%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
            <filter id="glow">
               <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
               <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
               </feMerge>
            </filter>
            {/* Pattern for the Mesh Grid */}
            <pattern id="gridPattern" width="10" height="10" patternUnits="userSpaceOnUse">
               <path d="M 10 0 L 0 0 0 10" fill="none" stroke={color} strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>

          {/* Face Geometry - Dense Mesh Wireframe */}
          <g filter="url(#glow)">
             {/* Main Face Contour (Filled with Grid) */}
             <path 
               d="M 40,60 Q 100,20 160,60 Q 190,120 160,200 Q 100,240 40,200 Q 10,120 40,60 Z" 
               fill="url(#gridPattern)"
               stroke={color} 
               strokeWidth="1.5" 
               opacity="0.6"
             />

             {/* Wireframe Triangulation Lines (The "Net") */}
             <path d="M 40,60 L 100,120 L 160,60" stroke={color} strokeWidth="0.5" opacity="0.4" fill="none" />
             <path d="M 40,60 L 100,90 L 160,60" stroke={color} strokeWidth="0.5" opacity="0.4" fill="none" />
             <path d="M 100,20 L 100,120" stroke={color} strokeWidth="0.5" opacity="0.4" fill="none" />
             <path d="M 10,120 L 100,120 L 190,120" stroke={color} strokeWidth="0.5" opacity="0.4" fill="none" />
             <path d="M 40,200 L 100,180 L 160,200" stroke={color} strokeWidth="0.5" opacity="0.4" fill="none" />
             <path d="M 100,120 L 40,200" stroke={color} strokeWidth="0.5" opacity="0.4" fill="none" />
             <path d="M 100,120 L 160,200" stroke={color} strokeWidth="0.5" opacity="0.4" fill="none" />
             
             {/* Eye Areas */}
             <path d="M 50,90 L 70,85 L 90,90 L 70,100 Z" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1" />
             <path d="M 110,90 L 130,85 L 150,90 L 130,100 Z" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1" />

             {/* Nodes/Sensors on Face */}
             <circle cx="100" cy="90" r="1.5" fill={color} /> {/* Bridge */}
             <circle cx="100" cy="120" r="1.5" fill={color} /> {/* Nose tip */}
             <circle cx="100" cy="150" r="1.5" fill={color} /> {/* Lips */}
             <circle cx="50" cy="140" r="1.5" fill={color} /> {/* Cheek L */}
             <circle cx="150" cy="140" r="1.5" fill={color} /> {/* Cheek R */}
             <circle cx="100" cy="240" r="2" fill={color} className={status === 'SCANNING' ? 'animate-ping' : ''} /> {/* Chin */}
          </g>

          {/* Scanning Laser Beam (Moves up and down) */}
          {(status === 'SCANNING' || status === 'LOCKED') && (
             <rect x="0" y="0" width="200" height="20" fill="url(#scanBeam)" opacity="0.8">
               <animate attributeName="y" from="-20" to="250" dur="1s" repeatCount="indefinite" />
             </rect>
          )}
          
          {/* Target Brackets around Face */}
          <path d="M 20,40 L 20,20 L 60,20" stroke={color} strokeWidth="2" fill="none" filter="url(#glow)" />
          <path d="M 180,40 L 180,20 L 140,20" stroke={color} strokeWidth="2" fill="none" filter="url(#glow)" />
          <path d="M 20,210 L 20,230 L 60,230" stroke={color} strokeWidth="2" fill="none" filter="url(#glow)" />
          <path d="M 180,210 L 180,230 L 140,230" stroke={color} strokeWidth="2" fill="none" filter="url(#glow)" />

        </svg>

        {/* Data Overlay Text */}
        {isLocked && (
            <div className="absolute top-1/2 left-0 w-full flex justify-between px-2 pointer-events-none">
                <div className="flex flex-col gap-1 text-[6px] font-mono text-cyan-300 opacity-70">
                    <span>X: {position.x.toFixed(2)}</span>
                    <span>Y: {position.y.toFixed(2)}</span>
                </div>
                <div className="flex flex-col gap-1 text-[6px] font-mono text-cyan-300 opacity-70 text-right">
                    <span>TRACKING: LOCKED</span>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  // Init DB
  useEffect(() => { authService.init(); }, []);

  // State
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [method, setMethod] = useState<LoginMethod>('PASSWORD');
  
  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // Status State
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Camera & Face State
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); 
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<ScanStatus>('IDLE');
  
  // Motion Tracking State
  const [facePosition, setFacePosition] = useState({ x: 0, y: 0 });
  const motionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevFrameRef = useRef<ImageData | null>(null);
  const requestRef = useRef<number>(0);

  // --- Motion Tracking Logic ---
  const detectMotion = () => {
    if (!videoRef.current || !motionCanvasRef.current) return;

    const video = videoRef.current;
    const canvas = motionCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Low res for performance (32x24)
    const w = 32;
    const h = 24;

    if (!ctx) return;

    // Draw current frame scaled down
    ctx.drawImage(video, 0, 0, w, h);
    const currentFrame = ctx.getImageData(0, 0, w, h);
    
    if (prevFrameRef.current) {
        let motionX = 0;
        let motionY = 0;
        let motionCount = 0;
        const threshold = 20; // Sensitivity

        // Loop pixels
        for (let i = 0; i < currentFrame.data.length; i += 4) {
            const rDiff = Math.abs(currentFrame.data[i] - prevFrameRef.current.data[i]);
            const gDiff = Math.abs(currentFrame.data[i+1] - prevFrameRef.current.data[i+1]);
            const bDiff = Math.abs(currentFrame.data[i+2] - prevFrameRef.current.data[i+2]);
            
            if (rDiff + gDiff + bDiff > threshold) {
                const pixelIndex = i / 4;
                const x = pixelIndex % w;
                const y = Math.floor(pixelIndex / w);
                
                motionX += x;
                motionY += y;
                motionCount++;
            }
        }

        if (motionCount > 5) { // Noise filter
            // Normalize to -1 to 1 range
            const avgX = (motionX / motionCount) / w; 
            const avgY = (motionY / motionCount) / h;
            const targetX = (avgX - 0.5) * 2;
            const targetY = (avgY - 0.5) * 2;

            // Smooth interpolation (Lerp)
            setFacePosition(prev => ({
                x: prev.x + (targetX - prev.x) * 0.1,
                y: prev.y + (targetY - prev.y) * 0.1
            }));
        } else {
            // Slowly drift back to center if no motion
            setFacePosition(prev => ({
                x: prev.x * 0.95,
                y: prev.y * 0.95
            }));
        }
    }

    prevFrameRef.current = currentFrame;
    requestRef.current = requestAnimationFrame(detectMotion);
  };

  // --- Camera Handling ---
  const startCamera = async () => {
    try {
      setError('');
      setScanStatus('SEEKING'); // Start seeking
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        // Start tracking loop
        requestRef.current = requestAnimationFrame(detectMotion);
      }
    } catch (err) {
      setError('Camera Access Denied or Unavailable');
      setScanStatus('ERROR');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const captureFrame = (): string | null => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.8);
      }
    }
    return null;
  };

  useEffect(() => {
    if ((method === 'FACE' && mode === 'LOGIN') || (isCameraActive && mode === 'REGISTER')) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [method, mode, isCameraActive]);

  // --- Actions ---

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (method === 'PASSWORD') {
      setIsLoading(true);
      const result = await authService.login(username, password);
      if (result.success && result.user) {
        onLogin(result.user);
      } else {
        setError(result.error || 'Authentication Failed');
        setIsLoading(false);
      }
    } else {
      handleScanFaceForLogin();
    }
  };

  const handleScanFaceForLogin = async () => {
    // 1. Simulate finding the face
    setScanStatus('SEEKING');
    setIsLoading(true);
    setError('');

    setTimeout(() => {
        setScanStatus('LOCKED'); // Face found, Net appears red
        
        setTimeout(() => {
            setScanStatus('SCANNING'); // Laser scan
            
            setTimeout(async () => {
                // Actual capture logic
                const image = captureFrame();
                if (!image) {
                    setScanStatus('ERROR');
                    setError('Camera Error: Could not capture frame.');
                    setIsLoading(false);
                    return;
                }

                const result = await authService.loginViaFace(image);
                
                if (result.success && result.user) {
                    setScanStatus('SUCCESS'); // Net turns green
                    stopCamera(); 
                    setTimeout(() => {
                        onLogin(result.user!);
                    }, 1000);
                } else {
                    setScanStatus('ERROR');
                    setError(result.error || 'Biometric Mismatch');
                    setIsLoading(false);
                }
            }, 1500); // Scan duration
        }, 800); // Lock duration
    }, 1000); // Seek duration
  };

  const handleRegisterFace = () => {
    setIsCameraActive(true);
    setScanStatus('SEEKING');
    setIsLoading(true);

    setTimeout(() => {
        setScanStatus('LOCKED');
        setTimeout(() => {
            setScanStatus('SCANNING');
            setTimeout(() => {
                const image = captureFrame();
                if (image) {
                    setCapturedImage(image);
                    setScanStatus('SUCCESS'); 
                    setIsLoading(false);
                    stopCamera();
                } else {
                    setScanStatus('ERROR');
                    setError('Capture failed');
                    setIsLoading(false);
                }
            }, 1500);
        }, 800);
    }, 1000);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password || !fullName) {
      setError('All text fields required');
      return;
    }
    if (!capturedImage) {
      setError('Biometric Face Data Required');
      return;
    }

    setIsLoading(true);
    const newUser: UserData = {
      username,
      name: fullName,
      role: 'ANALYST',
      level: 'OP-LEVEL-1',
      hasFaceId: true,
      faceImage: capturedImage
    };

    const result = await authService.register(newUser, password);
    setIsLoading(false);
    
    if (result.success) {
      setSuccessMsg('Operative Registered Successfully');
      setTimeout(() => {
        setMode('LOGIN');
        setMethod('PASSWORD');
        setSuccessMsg('');
        setUsername('');
        setPassword('');
        setCapturedImage(null);
        setScanStatus('IDLE');
      }, 2000);
    } else {
      setError(result.error || 'Registration Failed');
    }
  };

  // --- Render Helpers ---

  const renderFaceScanner = (actionText: string) => (
    <div className={`relative w-full aspect-video bg-black/80 border-2 rounded-xl overflow-hidden mb-6 group transition-all duration-500 shadow-2xl ${
      scanStatus === 'SUCCESS' ? 'border-emerald-500 shadow-emerald-500/50' : 
      (scanStatus === 'SCANNING' || scanStatus === 'LOCKED') ? 'border-red-500 shadow-red-500/50' : 
      scanStatus === 'SEEKING' ? 'border-blue-500 shadow-blue-500/30' :
      'border-slate-700 hover:border-blue-500/50'
    }`}>
      {/* Hidden Canvases for Logic */}
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={motionCanvasRef} width="32" height="24" className="hidden" />
      
      {/* Video Feed */}
      <video 
        ref={videoRef} 
        autoPlay 
        muted 
        playsInline
        className={`w-full h-full object-cover relative z-10 transition-all duration-500 ${scanStatus === 'SUCCESS' ? 'grayscale opacity-50' : 'opacity-80'}`} 
      />

      {/* The Face Net Mask */}
      {(isCameraActive) && (
         <BiometricNetMask status={scanStatus} position={facePosition} />
      )}
      
      {/* Status Text Overlay */}
      <div className="absolute bottom-4 left-0 w-full text-center z-30 pointer-events-none">
        <span className={`px-4 py-1.5 text-[10px] font-bold font-orbitron uppercase tracking-widest border rounded backdrop-blur-md transition-colors duration-300 shadow-lg ${
           scanStatus === 'SUCCESS' 
           ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
           : scanStatus === 'ERROR' ? 'bg-red-900/80 text-white border-red-500'
           : 'bg-black/60 text-cyan-400 border-cyan-500/50'
        }`}>
          {scanStatus === 'SEEKING' ? 'SEARCHING SUBJECT...' :
           scanStatus === 'LOCKED' ? 'SUBJECT LOCKED' :
           scanStatus === 'SCANNING' ? 'MAPPING BIOMETRICS...' : 
           scanStatus === 'SUCCESS' ? 'IDENTITY VERIFIED' : actionText}
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden font-rajdhani flex items-center justify-center bg-[#020617]">
      
      {/* 1. Futuristic Background Effects */}
      <BinaryNetworkBackground />
      
      {/* Dark Overlay Gradient to ensure text readability */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none"></div>

      {/* Main Glass Card */}
      <div className="relative z-10 w-full max-w-lg p-6 animate-in zoom-in-95 duration-700">
        <div className="bg-[#020617]/70 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden relative">
          
          {/* Top Border Highlight */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-900 to-transparent opacity-50"></div>

          <div className="p-8">
            
            {/* Header */}
            <div className="text-center mb-10">
               <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-900 to-black border border-white/10 mb-4 shadow-[0_0_30px_rgba(14,165,233,0.15)] group relative">
                 <div className="absolute inset-0 bg-cyan-500/10 blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                 <Cpu size={40} className="text-cyan-400 relative z-10 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" />
               </div>
               <h1 className="text-4xl font-bold text-white font-orbitron tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                 C-FORCE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">AI</span>
               </h1>
               <p className="text-cyan-200/60 text-xs uppercase tracking-[0.4em] font-bold mt-2">Neural Security Interface</p>
            </div>

            {/* Content */}
            {mode === 'LOGIN' ? (
              <>
                {/* Tabs */}
                <div className="flex bg-black/40 rounded-lg p-1 mb-8 border border-white/5 relative overflow-hidden">
                  <div className={`absolute top-0 bottom-0 w-1/2 bg-white/5 rounded transition-transform duration-300 ${method === 'FACE' ? 'translate-x-full' : 'translate-x-0'}`}></div>
                  <button 
                    onClick={() => { setMethod('PASSWORD'); setScanStatus('IDLE'); }}
                    className={`relative z-10 flex-1 py-3 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                      method === 'PASSWORD' 
                      ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]' 
                      : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    <Key size={14} /> Passcode
                  </button>
                  <button 
                    onClick={() => { setMethod('FACE'); setScanStatus('IDLE'); }}
                    className={`relative z-10 flex-1 py-3 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                      method === 'FACE' 
                      ? 'text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]' 
                      : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    <ScanFace size={14} /> Biometric
                  </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  {method === 'PASSWORD' ? (
                    <div className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
                      <div className="group">
                        <label className="text-[10px] text-cyan-300/70 uppercase tracking-widest font-bold mb-1.5 block">Operative ID</label>
                        <div className="relative">
                          <User className="absolute left-4 top-3.5 text-cyan-500/50 group-focus-within:text-cyan-400 transition-colors" size={18} />
                          <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 text-white pl-12 pr-4 py-3.5 rounded-lg focus:outline-none focus:border-cyan-500/50 focus:bg-white/5 transition-all font-mono placeholder:text-white/20"
                            placeholder="USERNAME"
                          />
                        </div>
                      </div>
                      <div className="group">
                        <label className="text-[10px] text-cyan-300/70 uppercase tracking-widest font-bold mb-1.5 block">Security Key</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-3.5 text-cyan-500/50 group-focus-within:text-cyan-400 transition-colors" size={18} />
                          <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 text-white pl-12 pr-4 py-3.5 rounded-lg focus:outline-none focus:border-cyan-500/50 focus:bg-white/5 transition-all font-mono placeholder:text-white/20"
                            placeholder="PASSWORD"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                       {renderFaceScanner('INITIATE SEQUENCE')}
                       <p className="text-center text-[10px] text-cyan-200/50 mt-2 font-mono">
                          Auto-Sensor Active. Net will engage upon detection.
                       </p>
                    </div>
                  )}

                  {/* Messages */}
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg flex items-center gap-3 text-red-400 text-xs font-bold animate-pulse">
                      <AlertTriangle size={16} />
                      {error}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className={`w-full py-4 rounded-lg font-bold font-orbitron tracking-widest text-sm uppercase transition-all duration-300 relative overflow-hidden group
                      ${isLoading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-900/40'}
                    `}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Activity className="animate-spin" size={16} /> PROCESSING...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                         {method === 'PASSWORD' ? 'ACCESS SYSTEM' : 'START AUTO-SCAN'} <Zap size={16} className="group-hover:text-yellow-300 transition-colors" />
                      </div>
                    )}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <button 
                    onClick={() => setMode('REGISTER')}
                    className="text-xs text-slate-400 hover:text-cyan-300 transition-colors uppercase tracking-widest font-bold flex items-center justify-center gap-2 mx-auto"
                  >
                    <UserPlus size={14} /> Initialize New Identity
                  </button>
                </div>
              </>
            ) : (
              // REGISTER MODE
              <form onSubmit={handleRegisterSubmit} className="space-y-5 animate-in slide-in-from-right-10 duration-500">
                <div className="flex items-center gap-2 mb-4 text-cyan-400 font-bold text-sm uppercase tracking-wider pb-2 border-b border-white/10">
                   <UserPlus size={16} /> New Operative Setup
                </div>

                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-500/50 focus:bg-white/5 text-sm font-mono placeholder:text-white/20"
                  placeholder="FULL NAME"
                />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-500/50 focus:bg-white/5 text-sm font-mono placeholder:text-white/20"
                  placeholder="USERNAME"
                />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-500/50 focus:bg-white/5 text-sm font-mono placeholder:text-white/20"
                  placeholder="PASSWORD"
                />

                <div className="p-4 bg-black/30 rounded-xl border border-white/10">
                   <div className="flex justify-between items-center mb-3">
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Biometric Enroll</label>
                      {scanStatus === 'SUCCESS' && <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1"><CheckCircle size={10} /> SAVED</span>}
                   </div>
                   
                   {scanStatus !== 'SUCCESS' ? (
                     !isCameraActive ? (
                        <button 
                          type="button"
                          onClick={() => { setIsCameraActive(true); setScanStatus('SEEKING'); }}
                          className="w-full py-3 bg-white/5 hover:bg-white/10 text-cyan-300 text-xs font-bold rounded-lg flex items-center justify-center gap-2 border border-white/10 transition-colors"
                        >
                           <Camera size={14} /> ACTIVATE SENSOR
                        </button>
                     ) : (
                        <>
                          {renderFaceScanner('CAPTURING...')}
                          <button 
                             type="button"
                             onClick={handleRegisterFace}
                             disabled={isLoading}
                             className="w-full py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-red-900/30 transition-all"
                          >
                             {isLoading ? 'SCANNING...' : 'CAPTURE DATA'}
                          </button>
                        </>
                     )
                   ) : (
                      <div className="w-full py-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg flex flex-col items-center justify-center gap-2">
                         <div className="flex items-center gap-2">
                           <ScanFace size={16} /> DATA SECURED
                         </div>
                         <button 
                           type="button" 
                           onClick={() => { setScanStatus('IDLE'); setCapturedImage(null); setIsCameraActive(true); }}
                           className="text-[10px] underline text-emerald-300/70 hover:text-emerald-300"
                         >
                           Retake
                         </button>
                      </div>
                   )}
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg flex items-center gap-2 text-red-400 text-xs font-bold">
                    <AlertTriangle size={12} /> {error}
                  </div>
                )}
                {successMsg && (
                   <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <CheckCircle size={12} /> {successMsg}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                   <button 
                      type="button"
                      onClick={() => { setMode('LOGIN'); stopCamera(); setError(''); setScanStatus('IDLE'); }}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg font-bold font-orbitron tracking-wider text-xs uppercase transition-colors"
                   >
                      <ArrowLeft size={14} className="inline mr-1" /> BACK
                   </button>
                   <button 
                      type="submit"
                      disabled={isLoading}
                      className="flex-[2] py-3 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg font-bold font-orbitron tracking-wider text-xs uppercase shadow-lg shadow-cyan-900/30 transition-colors"
                   >
                      {isLoading ? <Activity size={14} className="animate-spin inline" /> : 'REGISTER'}
                   </button>
                </div>
              </form>
            )}
          </div>
        </div>
        
        {/* Footer Text */}
        <div className="mt-6 text-center">
           <p className="text-[10px] text-cyan-200/30 font-mono">SECURE CONNECTION ESTABLISHED // ENCRYPTION: AES-256-GCM</p>
        </div>
      </div>
    </div>
  );
};