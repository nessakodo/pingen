'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowPathIcon, SparklesIcon, ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface RemixResult {
  title: string;
  imagePrompt: string;
  description: string;
  hashtags: string[];
  imageUrl: string | null;
  imageError?: string;
}

export default function Home() {
  const [boardUrl, setBoardUrl] = useState('');
  const [projectGoal, setProjectGoal] = useState('');
  const [creativeTwist, setCreativeTwist] = useState('');
  const [imageText, setImageText] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [visualStyle, setVisualStyle] = useState('');
  const [results, setResults] = useState<RemixResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleRemix = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardUrl || !projectGoal || !creativeTwist) {
      setError('Please provide all required fields');
      return;
    }
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('/api/remix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boardUrl,
          projectGoal,
          creativeTwist,
          imageText,
          visualStyle: showAdvanced ? visualStyle : undefined,
        }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to remix board');
      }

      if (!data.pins || !Array.isArray(data.pins)) {
        throw new Error('Invalid response format: missing pins array');
      }

      setResults(data.pins);
    } catch (err) {
      console.error('Remix error:', err);
      setError(err instanceof Error ? err.message : 'Failed to remix board');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async (imageUrl: string, title: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const shareToPinterest = (imageUrl: string, title: string, description: string) => {
    const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(`${title}\n\n${description}`)}`;
    window.open(pinterestUrl, '_blank');
  };

  if (!isMounted) {
    return null;
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          CollabMoodboard.AI
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Transform your Pinterest boards with AI-powered creative collaboration
        </p>
      </motion.div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
        <form onSubmit={handleRemix} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pinterest Board URL *
            </label>
            <input
              type="text"
              value={boardUrl}
              onChange={(e) => setBoardUrl(e.target.value)}
              placeholder="https://pin.it/..."
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project Goal *
            </label>
            <input
              type="text"
              value={projectGoal}
              onChange={(e) => setProjectGoal(e.target.value)}
              placeholder="e.g., A summer music festival for Gen Z celebrating creative freedom"
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Creative Twist *
            </label>
            <input
              type="text"
              value={creativeTwist}
              onChange={(e) => setCreativeTwist(e.target.value)}
              placeholder="e.g., Add Memphis-inspired patterns and pastel gradients"
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Text for Images (Optional)
            </label>
            <input
              type="text"
              value={imageText}
              onChange={(e) => setImageText(e.target.value)}
              placeholder="e.g., Create Your Future Here"
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
            >
              {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
            </button>
          </div>

          {showAdvanced && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Visual Style/Constraints
              </label>
              <textarea
                value={visualStyle}
                onChange={(e) => setVisualStyle(e.target.value)}
                placeholder="e.g., Use bold sans-serif type, pastel gradients, and hand-drawn elements"
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-24"
              />
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                Remixing...
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5" />
                Remix Moodboard
              </>
            )}
          </button>
        </form>
      </div>

      {results.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Remixed Ideas</h2>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {results.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex-none w-[400px] bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
              >
                {result.imageUrl ? (
                  <div className="relative aspect-square w-full">
                    <Image
                      src={result.imageUrl}
                      alt={result.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      {result.imageError || 'Loading image...'}
                    </p>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {result.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {result.description}
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {result.imagePrompt}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {result.hashtags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {result.imageUrl && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadImage(result.imageUrl!, result.title)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Download
                      </button>
                      <button
                        onClick={() => shareToPinterest(result.imageUrl!, result.title, result.description)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <ShareIcon className="w-5 h-5" />
                        Share to Pinterest
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
