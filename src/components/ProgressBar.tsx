import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSupabase } from '../lib/supabase-client';

interface ProgressBarProps {
  summaryId: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ summaryId }) => {
  const [progress, setProgress] = useState(0);
  const supabase = useSupabase();

  useEffect(() => {
    const channel = supabase
      .channel(`summary_progress:${summaryId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'summaries', filter: `id=eq.${summaryId}` }, (payload) => {
        if (payload.new && typeof payload.new.progress === 'number') {
          setProgress(payload.new.progress);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [summaryId, supabase]);

  return (
    <motion.div 
      layoutId="progress-bar-container"
      className="w-full bg-muted rounded-full h-2.5 dark:bg-muted overflow-hidden"
    >
      <motion.div
        layoutId="progress-bar-fill"
        className="bg-gradient-light dark:bg-gradient-dark h-2.5 rounded-full"
        style={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      ></motion.div>
    </motion.div>
  );
};

export default ProgressBar;