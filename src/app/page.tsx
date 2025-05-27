'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface RemixResult {
  title: string;
  imagePrompt: string;
  description: string;
  hashtags: string[];
}

export default function Home() {
  const [boardUrl, setBoardUrl] = useState('');
  const [twist, setTwist] = useState('');
  const [results, setResults] = useState<RemixResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRemix = async () => {
    if (!boardUrl || !twist) {
      setError('Please provide both a Pinterest board URL and your creative twist');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/remix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardUrl, twistPrompt: twist }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remix board');
      }

      if (!data.pins || !Array.isArray(data.pins)) {
        throw new Error('Invalid response format from server');
      }

      setResults(data.pins);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
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
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pinterest Board URL
            </label>
            <input
              type="text"
              value={boardUrl}
              onChange={(e) => setBoardUrl(e.target.value)}
              placeholder="https://pin.it/..."
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Creative Twist
            </label>
            <textarea
              value={twist}
              onChange={(e) => setTwist(e.target.value)}
              placeholder="e.g., 'add sunset tones and playful shapes'"
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-24"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            onClick={handleRemix}
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
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Remixed Ideas</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {results.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {result.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {result.description}
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {result.imagePrompt}
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.hashtags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
