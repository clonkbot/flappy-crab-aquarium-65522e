import { useState, useEffect, useCallback, useRef } from 'react';

// Game constants
const GRAVITY = 0.35;
const JUMP_FORCE = -7;
const PIPE_WIDTH = 80;
const PIPE_GAP = 180;
const PIPE_SPEED = 3;
const CRAB_SIZE = 50;

interface Pipe {
  x: number;
  topHeight: number;
  passed: boolean;
  id: number;
}

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

function Crab({ y, rotation }: { y: number; rotation: number }) {
  return (
    <div
      className="absolute transition-transform duration-75"
      style={{
        left: '20%',
        top: y,
        width: CRAB_SIZE,
        height: CRAB_SIZE,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {/* Crab body */}
      <svg viewBox="0 0 60 50" className="w-full h-full drop-shadow-[0_0_10px_rgba(255,127,80,0.6)]">
        {/* Main shell */}
        <ellipse cx="30" cy="28" rx="22" ry="16" fill="#FF6B4A" />
        <ellipse cx="30" cy="26" rx="18" ry="12" fill="#FF8A6A" />
        <ellipse cx="30" cy="24" rx="12" ry="8" fill="#FFA07A" />

        {/* Eyes */}
        <ellipse cx="22" cy="14" rx="5" ry="7" fill="#FF6B4A" />
        <ellipse cx="38" cy="14" rx="5" ry="7" fill="#FF6B4A" />
        <circle cx="22" cy="12" r="3" fill="white" />
        <circle cx="38" cy="12" r="3" fill="white" />
        <circle cx="23" cy="11" r="1.5" fill="#1a1a2e" />
        <circle cx="39" cy="11" r="1.5" fill="#1a1a2e" />

        {/* Claws - animated */}
        <g className="animate-[pinch_0.3s_ease-in-out_infinite]">
          <path d="M5 25 Q0 20 5 15 L10 20 Q8 25 10 30 Z" fill="#FF6B4A" />
          <path d="M5 30 Q-2 35 5 40 L12 35 Q8 30 12 25 Z" fill="#FF6B4A" />
        </g>
        <g className="animate-[pinch_0.3s_ease-in-out_infinite]" style={{ animationDelay: '0.15s' }}>
          <path d="M55 25 Q60 20 55 15 L50 20 Q52 25 50 30 Z" fill="#FF6B4A" />
          <path d="M55 30 Q62 35 55 40 L48 35 Q52 30 48 25 Z" fill="#FF6B4A" />
        </g>

        {/* Legs */}
        <line x1="12" y1="35" x2="5" y2="42" stroke="#FF6B4A" strokeWidth="3" strokeLinecap="round" />
        <line x1="15" y1="38" x2="8" y2="46" stroke="#FF6B4A" strokeWidth="3" strokeLinecap="round" />
        <line x1="48" y1="35" x2="55" y2="42" stroke="#FF6B4A" strokeWidth="3" strokeLinecap="round" />
        <line x1="45" y1="38" x2="52" y2="46" stroke="#FF6B4A" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function CoralPipe({ x, topHeight, gameHeight, gap }: { x: number; topHeight: number; gameHeight: number; gap: number }) {
  const bottomY = topHeight + gap;
  const bottomHeight = gameHeight - bottomY;

  return (
    <>
      {/* Top coral */}
      <div
        className="absolute"
        style={{ left: x, top: 0, width: PIPE_WIDTH, height: topHeight }}
      >
        <svg viewBox="0 0 80 200" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="coralGradTop" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E91E63" />
              <stop offset="50%" stopColor="#FF4081" />
              <stop offset="100%" stopColor="#E91E63" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <rect x="10" y="0" width="60" height="100%" fill="url(#coralGradTop)" filter="url(#glow)" rx="5" />
          {/* Coral texture */}
          <circle cx="25" cy="30%" r="8" fill="#FF6090" opacity="0.6" />
          <circle cx="55" cy="50%" r="10" fill="#FF6090" opacity="0.5" />
          <circle cx="35" cy="70%" r="6" fill="#FF6090" opacity="0.7" />
          {/* Bottom cap */}
          <ellipse cx="40" cy="100%" rx="40" ry="15" fill="#E91E63" />
          <ellipse cx="40" cy="100%" rx="35" ry="10" fill="#FF4081" />
        </svg>
      </div>

      {/* Bottom coral */}
      <div
        className="absolute"
        style={{ left: x, top: bottomY, width: PIPE_WIDTH, height: bottomHeight }}
      >
        <svg viewBox="0 0 80 200" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="coralGradBot" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9C27B0" />
              <stop offset="50%" stopColor="#BA68C8" />
              <stop offset="100%" stopColor="#9C27B0" />
            </linearGradient>
          </defs>
          {/* Top cap */}
          <ellipse cx="40" cy="0" rx="40" ry="15" fill="#9C27B0" />
          <ellipse cx="40" cy="0" rx="35" ry="10" fill="#BA68C8" />
          <rect x="10" y="0" width="60" height="100%" fill="url(#coralGradBot)" filter="url(#glow)" rx="5" />
          {/* Coral texture */}
          <circle cx="30" cy="20%" r="9" fill="#CE93D8" opacity="0.5" />
          <circle cx="50" cy="45%" r="7" fill="#CE93D8" opacity="0.6" />
          <circle cx="25" cy="65%" r="11" fill="#CE93D8" opacity="0.4" />
        </svg>
      </div>
    </>
  );
}

function BubbleEffect({ bubbles }: { bubbles: Bubble[] }) {
  return (
    <>
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute rounded-full border border-cyan-300/50 bg-gradient-to-br from-cyan-200/20 to-transparent"
          style={{
            left: bubble.x,
            top: bubble.y,
            width: bubble.size,
            height: bubble.size,
            opacity: bubble.opacity,
          }}
        />
      ))}
    </>
  );
}

function SeaFloor() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-16 md:h-20">
      <svg viewBox="0 0 400 80" preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id="sandGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5D4E37" />
            <stop offset="100%" stopColor="#3D3227" />
          </linearGradient>
        </defs>
        <path d="M0 20 Q50 10 100 25 T200 20 T300 25 T400 15 L400 80 L0 80 Z" fill="url(#sandGrad)" />
        {/* Seaweed */}
        <path d="M30 80 Q25 50 35 30 Q30 20 40 10" stroke="#2E7D32" strokeWidth="4" fill="none" className="animate-[sway_3s_ease-in-out_infinite]" />
        <path d="M80 80 Q85 60 75 40 Q80 25 70 10" stroke="#388E3C" strokeWidth="3" fill="none" className="animate-[sway_2.5s_ease-in-out_infinite_0.5s]" />
        <path d="M150 80 Q145 55 155 35 Q150 20 160 5" stroke="#43A047" strokeWidth="4" fill="none" className="animate-[sway_3.5s_ease-in-out_infinite_1s]" />
        <path d="M250 80 Q255 50 245 30 Q250 15 240 0" stroke="#2E7D32" strokeWidth="3" fill="none" className="animate-[sway_2.8s_ease-in-out_infinite_0.3s]" />
        <path d="M320 80 Q315 60 325 40 Q320 25 330 10" stroke="#388E3C" strokeWidth="4" fill="none" className="animate-[sway_3.2s_ease-in-out_infinite_0.7s]" />
        <path d="M370 80 Q375 50 365 25 Q370 10 360 0" stroke="#43A047" strokeWidth="3" fill="none" className="animate-[sway_2.6s_ease-in-out_infinite_1.2s]" />
        {/* Rocks */}
        <ellipse cx="60" cy="70" rx="20" ry="12" fill="#4A4A4A" />
        <ellipse cx="200" cy="72" rx="25" ry="10" fill="#3A3A3A" />
        <ellipse cx="340" cy="68" rx="18" ry="14" fill="#4A4A4A" />
      </svg>
    </div>
  );
}

function LightRays() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-[10%] w-32 md:w-48 h-full bg-gradient-to-b from-cyan-300/10 via-cyan-300/5 to-transparent transform -skew-x-12 animate-[pulse_4s_ease-in-out_infinite]" />
      <div className="absolute top-0 left-[30%] w-24 md:w-36 h-full bg-gradient-to-b from-cyan-200/8 via-cyan-200/3 to-transparent transform -skew-x-6 animate-[pulse_5s_ease-in-out_infinite_1s]" />
      <div className="absolute top-0 left-[60%] w-40 md:w-56 h-full bg-gradient-to-b from-cyan-300/6 via-cyan-300/2 to-transparent transform -skew-x-12 animate-[pulse_6s_ease-in-out_infinite_2s]" />
      <div className="absolute top-0 left-[80%] w-20 md:w-28 h-full bg-gradient-to-b from-cyan-200/10 via-cyan-200/4 to-transparent transform -skew-x-3 animate-[pulse_4.5s_ease-in-out_infinite_0.5s]" />
    </div>
  );
}

export default function App() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver'>('start');
  const [crabY, setCrabY] = useState(250);
  const [crabVelocity, setCrabVelocity] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('flappyCrabHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const gameRef = useRef<HTMLDivElement>(null);
  const [gameSize, setGameSize] = useState({ width: 400, height: 600 });
  const pipeIdRef = useRef(0);
  const bubbleIdRef = useRef(0);

  // Update game size on resize
  useEffect(() => {
    const updateSize = () => {
      if (gameRef.current) {
        const rect = gameRef.current.getBoundingClientRect();
        setGameSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const jump = useCallback(() => {
    if (gameState === 'start') {
      setGameState('playing');
      setCrabY(gameSize.height / 2);
      setCrabVelocity(JUMP_FORCE);
      setPipes([]);
      setScore(0);
    } else if (gameState === 'playing') {
      setCrabVelocity(JUMP_FORCE);
      // Add bubbles on jump
      const newBubbles: Bubble[] = Array.from({ length: 5 }, () => ({
        id: bubbleIdRef.current++,
        x: gameSize.width * 0.2 + Math.random() * 30,
        y: crabY + Math.random() * 30,
        size: 5 + Math.random() * 10,
        speed: 1 + Math.random() * 2,
        opacity: 0.3 + Math.random() * 0.4,
      }));
      setBubbles(prev => [...prev, ...newBubbles]);
    } else if (gameState === 'gameOver') {
      setGameState('start');
      setCrabY(gameSize.height / 2);
      setCrabVelocity(0);
    }
  }, [gameState, crabY, gameSize.height, gameSize.width]);

  // Handle keyboard and touch
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      // Update crab position
      setCrabY(prev => {
        const newY = prev + crabVelocity;
        return newY;
      });
      setCrabVelocity(prev => prev + GRAVITY);

      // Update pipes
      setPipes(prev => {
        let newPipes = prev
          .map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED }))
          .filter(pipe => pipe.x > -PIPE_WIDTH);

        // Add new pipe
        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < gameSize.width - 250) {
          const minHeight = 50;
          const maxHeight = gameSize.height - PIPE_GAP - minHeight - 80;
          newPipes.push({
            x: gameSize.width,
            topHeight: minHeight + Math.random() * maxHeight,
            passed: false,
            id: pipeIdRef.current++,
          });
        }

        return newPipes;
      });

      // Update bubbles
      setBubbles(prev =>
        prev
          .map(b => ({ ...b, y: b.y - b.speed, opacity: b.opacity - 0.01 }))
          .filter(b => b.opacity > 0 && b.y > 0)
      );
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [gameState, crabVelocity, gameSize.width, gameSize.height]);

  // Collision detection and scoring
  useEffect(() => {
    if (gameState !== 'playing') return;

    const crabLeft = gameSize.width * 0.2;
    const crabRight = crabLeft + CRAB_SIZE;
    const crabTop = crabY;
    const crabBottom = crabY + CRAB_SIZE;

    // Check floor/ceiling collision
    if (crabTop < 0 || crabBottom > gameSize.height - 64) {
      setGameState('gameOver');
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('flappyCrabHighScore', score.toString());
      }
      return;
    }

    // Check pipe collision and scoring
    pipes.forEach(pipe => {
      const pipeLeft = pipe.x + 10;
      const pipeRight = pipe.x + PIPE_WIDTH - 10;
      const gapTop = pipe.topHeight;
      const gapBottom = pipe.topHeight + PIPE_GAP;

      // Check if crab passed the pipe
      if (!pipe.passed && pipeLeft < crabLeft) {
        pipe.passed = true;
        setScore(s => s + 1);
      }

      // Collision check
      if (crabRight > pipeLeft && crabLeft < pipeRight) {
        if (crabTop < gapTop || crabBottom > gapBottom) {
          setGameState('gameOver');
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('flappyCrabHighScore', score.toString());
          }
        }
      }
    });
  }, [crabY, pipes, gameState, score, highScore, gameSize.width, gameSize.height]);

  // Background bubbles
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setBubbles(prev => [
        ...prev,
        {
          id: bubbleIdRef.current++,
          x: Math.random() * gameSize.width,
          y: gameSize.height,
          size: 3 + Math.random() * 8,
          speed: 0.5 + Math.random() * 1.5,
          opacity: 0.2 + Math.random() * 0.3,
        },
      ]);
    }, 500);
    return () => clearInterval(interval);
  }, [gameState, gameSize.width, gameSize.height]);

  const crabRotation = Math.min(Math.max(crabVelocity * 3, -30), 45);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0d2847] to-[#0a1628] flex flex-col items-center justify-center p-2 md:p-4 overflow-hidden">
      {/* Ambient particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan-400/20 animate-[float_10s_ease-in-out_infinite]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Title */}
      <h1 className="font-display text-3xl md:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-pink-400 to-orange-400 mb-2 md:mb-4 drop-shadow-[0_0_30px_rgba(0,255,255,0.3)] animate-[pulse_3s_ease-in-out_infinite]">
        Flappy Crab
      </h1>

      {/* Score display */}
      <div className="flex gap-4 md:gap-8 mb-2 md:mb-4">
        <div className="text-cyan-300 font-body text-base md:text-lg">
          Score: <span className="text-xl md:text-2xl font-bold text-white">{score}</span>
        </div>
        <div className="text-pink-300 font-body text-base md:text-lg">
          Best: <span className="text-xl md:text-2xl font-bold text-white">{highScore}</span>
        </div>
      </div>

      {/* Game container */}
      <div
        ref={gameRef}
        onClick={jump}
        onTouchStart={(e) => { e.preventDefault(); jump(); }}
        className="relative w-full max-w-[400px] aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer select-none shadow-[0_0_60px_rgba(0,200,255,0.2),inset_0_0_60px_rgba(0,100,150,0.1)] border border-cyan-500/20"
        style={{
          background: 'linear-gradient(180deg, #041C32 0%, #064663 40%, #04293A 70%, #041C32 100%)',
        }}
      >
        {/* Light rays */}
        <LightRays />

        {/* Bubbles */}
        <BubbleEffect bubbles={bubbles} />

        {/* Pipes/Coral */}
        {pipes.map(pipe => (
          <CoralPipe
            key={pipe.id}
            x={pipe.x}
            topHeight={pipe.topHeight}
            gameHeight={gameSize.height}
            gap={PIPE_GAP}
          />
        ))}

        {/* Crab */}
        {gameState !== 'start' && <Crab y={crabY} rotation={crabRotation} />}

        {/* Sea floor */}
        <SeaFloor />

        {/* Start screen */}
        {gameState === 'start' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="text-center px-4">
              <div className="mb-4 md:mb-6 animate-[bounce_2s_ease-in-out_infinite]">
                <svg viewBox="0 0 60 50" className="w-20 h-20 md:w-24 md:h-24 mx-auto drop-shadow-[0_0_20px_rgba(255,127,80,0.6)]">
                  <ellipse cx="30" cy="28" rx="22" ry="16" fill="#FF6B4A" />
                  <ellipse cx="30" cy="26" rx="18" ry="12" fill="#FF8A6A" />
                  <ellipse cx="30" cy="24" rx="12" ry="8" fill="#FFA07A" />
                  <ellipse cx="22" cy="14" rx="5" ry="7" fill="#FF6B4A" />
                  <ellipse cx="38" cy="14" rx="5" ry="7" fill="#FF6B4A" />
                  <circle cx="22" cy="12" r="3" fill="white" />
                  <circle cx="38" cy="12" r="3" fill="white" />
                  <circle cx="23" cy="11" r="1.5" fill="#1a1a2e" />
                  <circle cx="39" cy="11" r="1.5" fill="#1a1a2e" />
                  <path d="M5 25 Q0 20 5 15 L10 20 Q8 25 10 30 Z" fill="#FF6B4A" />
                  <path d="M5 30 Q-2 35 5 40 L12 35 Q8 30 12 25 Z" fill="#FF6B4A" />
                  <path d="M55 25 Q60 20 55 15 L50 20 Q52 25 50 30 Z" fill="#FF6B4A" />
                  <path d="M55 30 Q62 35 55 40 L48 35 Q52 30 48 25 Z" fill="#FF6B4A" />
                </svg>
              </div>
              <p className="text-cyan-200 font-body text-lg md:text-xl mb-2">Tap or Press Space</p>
              <p className="text-cyan-400/60 font-body text-sm md:text-base">to start swimming!</p>
            </div>
          </div>
        )}

        {/* Game over screen */}
        {gameState === 'gameOver' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="text-center px-4">
              <h2 className="font-display text-3xl md:text-4xl text-red-400 mb-2 md:mb-4 animate-[shake_0.5s_ease-in-out]">
                Game Over!
              </h2>
              <p className="text-cyan-200 font-body text-xl md:text-2xl mb-1 md:mb-2">Score: {score}</p>
              {score >= highScore && score > 0 && (
                <p className="text-yellow-400 font-body text-base md:text-lg mb-2 md:mb-4 animate-[pulse_1s_ease-in-out_infinite]">
                  New High Score!
                </p>
              )}
              <p className="text-cyan-400/60 font-body text-sm md:text-base mt-4 md:mt-6">Tap to try again</p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <p className="text-cyan-400/50 font-body text-xs md:text-sm mt-3 md:mt-4 text-center px-4">
        Navigate through the coral reef without hitting obstacles!
      </p>

      {/* Footer */}
      <footer className="mt-6 md:mt-8 text-center">
        <p className="text-cyan-600/40 font-body text-[10px] md:text-xs">
          Requested by @OxPaulius · Built by @clonkbot
        </p>
      </footer>

      {/* Global styles */}
      <style>{`
        @keyframes pinch {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(10deg); }
        }
        @keyframes sway {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          50% { transform: translateX(3px) rotate(3deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </div>
  );
}
