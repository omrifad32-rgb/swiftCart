import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';

const SalesBox: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setPosition({ x, y });
  };
  
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
       const rect = e.currentTarget.getBoundingClientRect();
       const x = (e.touches[0].clientX - rect.left) / rect.width - 0.5;
       const y = (e.touches[0].clientY - rect.top) / rect.height - 0.5;
       setPosition({ x, y });
    }
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseLeave={() => setPosition({ x: 0, y: 0 })}
      onTouchEnd={() => setPosition({ x: 0, y: 0 })}
      animate={{ rotateX: position.y * -30, rotateY: position.x * 30 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
      className="relative group mx-auto inline-block z-10"
    >
       <div className="absolute inset-0 bg-gradient-to-br from-pri via-gold to-[#a200ff] rounded-[40px] blur-2xl opacity-20 group-hover:opacity-40 transition-all duration-700 pointer-events-none"></div>
       <div 
         className="relative bg-black/40 backdrop-blur-2xl border border-white/20 p-8 sm:p-12 rounded-[40px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col items-center gap-2 min-w-[280px]"
         style={{ transform: 'translateZ(30px)', transformStyle: 'preserve-3d' }}
       >
          <div className="flex gap-2 mb-4" style={{ transform: 'translateZ(40px)' }}>
             {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-8 h-8 text-gold fill-gold drop-shadow-[0_0_15px_rgba(252,238,10,0.8)]" />
             ))}
          </div>
          <div 
            className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400"
            style={{ transform: 'translateZ(60px)' }}
          >
            10,000<span className="text-pri">+</span>
          </div>
          <div 
            className="text-2xl md:text-3xl font-bold text-gray-300 tracking-widest uppercase mt-4"
            style={{ transform: 'translateZ(40px)' }}
          >
            מכירות מוצלחות
          </div>
          <p className="text-gray-500 font-medium text-sm mt-4 text-center max-w-[200px]" style={{ transform: 'translateZ(20px)' }}>
            אלפי לקוחות כבר בחרו בנו. הצטרפו להצלחה!
          </p>
          <div className="absolute top-6 right-6" style={{ transform: 'translateZ(30px)' }}>
             <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_15px_#22c55e] animate-ping absolute inset-0" />
             <div className="w-3 h-3 bg-green-500 rounded-full relative z-10" />
          </div>
       </div>
    </motion.div>
  );
};

export default SalesBox;
