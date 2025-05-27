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
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to download image');
      }

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
      setError('Failed to download image. Please try again.');
    }
  };

  const shareToPinterest = (imageUrl: string, title: string, description: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.joebenavente.com';
    const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(baseUrl)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(`${title}\n\n${description}`)}`;
    window.open(pinterestUrl, '_blank');
  };

  if (!isMounted) {
    return null;
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4 text-accent">
          Pingen
        </h1>
        <p className="text-muted text-lg">
          Instantly Remix Your Inspiration
        </p>
      </motion.div>

      <div className="card p-8 mb-8">
        <form onSubmit={handleRemix} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              Pinterest Board URL *
            </label>
            <input
              type="text"
              value={boardUrl}
              onChange={(e) => setBoardUrl(e.target.value)}
              placeholder="https://pin.it/..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              Project Goal *
            </label>
            <input
              type="text"
              value={projectGoal}
              onChange={(e) => setProjectGoal(e.target.value)}
              placeholder="e.g., A summer music festival for Gen Z celebrating creative freedom"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              Creative Twist *
            </label>
            <input
              type="text"
              value={creativeTwist}
              onChange={(e) => setCreativeTwist(e.target.value)}
              placeholder="e.g., Add Memphis-inspired patterns and pastel gradients"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              Text for Images (Optional)
            </label>
            <input
              type="text"
              value={imageText}
              onChange={(e) => setImageText(e.target.value)}
              placeholder="e.g., Create Your Future Here"
            />
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-muted border border-muted rounded-md px-3 py-1 hover:text-foreground hover:border-foreground transition-colors"
            >
              {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
            </button>
          </div>

          {showAdvanced && (
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Visual Style/Constraints
              </label>
              <textarea
                value={visualStyle}
                onChange={(e) => setVisualStyle(e.target.value)}
                placeholder="e.g., Use bold sans-serif type, pastel gradients, and hand-drawn elements"
                className="h-24"
              />
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 primary-button"
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
        <div className="space-y-8 mt-12">
          <h2 className="text-2xl font-bold text-foreground text-center">Your Remixed Ideas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card overflow-hidden flex flex-col"
              >
                {result.imageUrl ? (
                  <div className="relative aspect-square w-full flex-shrink-0">
                    <Image
                      src={result.imageUrl}
                      alt={result.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square w-full bg-muted/20 flex items-center justify-center">
                    <p className="text-muted text-sm">Failed to generate image</p>
                  </div>
                )}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-medium mb-2 text-foreground text-lg leading-tight">{result.title}</h3>
                  <p className="text-sm text-muted mb-4 flex-grow leading-relaxed">{result.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {result.hashtags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-full bg-muted/20 text-muted"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => result.imageUrl && downloadImage(result.imageUrl, result.title)}
                      className="flex-1 flex items-center justify-center gap-1 text-sm"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => result.imageUrl && shareToPinterest(result.imageUrl, result.title, result.description)}
                      className="flex-1 flex items-center justify-center gap-1 text-sm"
                    >
                      <ShareIcon className="w-4 h-4" />
                      Share
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
