import React from 'react';
import { motion } from 'framer-motion';
import { useVideoStore } from '@/store/videoStore';

const VideoInput: React.FC = () => {
  const { videoUrl, setVideoUrl, isLoading, summarizeVideo } = useVideoStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await summarizeVideo();
  };

  return (
    <motion.div 
      layoutId="video-input-container"
      className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md dark:bg-gray-800"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            URL del video de YouTube
          </label>
          <input
            type="url"
            id="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>
        <motion.button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? 'Resumiendo...' : 'Resumir'}
        </motion.button>
      </form>
      {isLoading && (
        <div className="mt-4">
          <div className="w-full bg-muted rounded-full h-2.5 dark:bg-muted overflow-hidden">
            <div className="bg-gradient-light dark:bg-gradient-dark h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
          <p className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
            Resumiendo...
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default VideoInput;
