'use client';

import { useState, useEffect } from 'react';
import Editor from '@/components/editor/Editor';
import { Loader } from '@/components/ui/loader';

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading time or wait for specific assets
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Adjust time as needed

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      {loading ? <Loader /> : <Editor />}
    </main>
  );
}
