import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const CountdownTimer = ({ targetTime }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!targetTime) return;

    const [hours, minutes] = targetTime.split(':');
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

      // If target time has passed today, assume it's for tomorrow
      if (target < now) {
        target.setDate(target.getDate() + 1);
      }

      const diff = target - now;
      if (diff <= 0) return '00:00:00';

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);

      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime]);

  if (!targetTime) return null;

  return (
    <div className="flex items-center gap-2 text-primary font-mono bg-primary/10 px-3 py-1.5 rounded-md text-sm border border-primary/20">
      <Clock size={14} />
      <span className="font-semibold">{timeLeft}</span>
    </div>
  );
};

export default CountdownTimer;
