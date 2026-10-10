import React from 'react';

export const BackgroundShapes: React.FC = () => {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 select-none" aria-hidden="true">
      {/* 1. Base clean white & light blue background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#ffffff] via-[#f6fafe] to-[#edf5fd]" />

      {/* 2. Crystal-Clear AI Neural Network Mesh (Clean, seamless, zero border lines) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-[0.65] transition-opacity duration-500"
        style={{
          backgroundImage: `url('/ai-network-bg.png')`,
        }}
      />

      {/* 3. Soft ambient light-blue volumetric glows for luminous AI feel */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-sky-100/60 blur-[140px]" />
      <div className="absolute top-[30%] right-[-8%] w-[550px] h-[550px] rounded-full bg-blue-100/50 blur-[130px]" />
      <div className="absolute bottom-[-10%] left-[25%] w-[650px] h-[650px] rounded-full bg-cyan-50/70 blur-[150px]" />

      {/* 5. Delicate Glowing Neural Nodes (Plexus dots in light blue) */}
      {/* Node 1 */}
      <span 
        className="absolute rounded-full animate-float-slow opacity-60 shadow-[0_0_14px_rgba(56,189,248,0.7)]"
        style={{
          width: '10px',
          height: '10px',
          background: '#0284c7',
          border: '2px solid #bae6fd',
          top: '18%',
          left: '12%',
        }}
      />

      {/* Node 2 */}
      <span 
        className="absolute rounded-full animate-float-slower opacity-50 shadow-[0_0_12px_rgba(37,99,235,0.6)]"
        style={{
          width: '8px',
          height: '8px',
          background: '#2563eb',
          border: '2px solid #93c5fd',
          top: '28%',
          right: '18%',
        }}
      />

      {/* Node 3 */}
      <span 
        className="absolute rounded-full animate-float-slow opacity-55 shadow-[0_0_16px_rgba(14,165,233,0.7)]"
        style={{
          width: '12px',
          height: '12px',
          background: '#38bdf8',
          border: '2px solid #ffffff',
          top: '65%',
          left: '8%',
        }}
      />

      {/* Node 4 */}
      <span 
        className="absolute rounded-full animate-float-slower opacity-45 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        style={{
          width: '7px',
          height: '7px',
          background: '#60a5fa',
          border: '1.5px solid #dbeafe',
          top: '75%',
          right: '12%',
        }}
      />

      {/* Node 5 */}
      <span 
        className="absolute rounded-full animate-float-slow opacity-50 shadow-[0_0_14px_rgba(56,189,248,0.6)]"
        style={{
          width: '9px',
          height: '9px',
          background: '#0ea5e9',
          border: '2px solid #e0f2fe',
          top: '45%',
          left: '32%',
        }}
      />
    </div>
  );
};
