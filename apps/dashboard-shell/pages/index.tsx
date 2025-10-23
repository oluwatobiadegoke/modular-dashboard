import React, { Suspense, useEffect, useState } from 'react';
import Emitter from 'tiny-emitter';
import { Card, CardHeader, CardTitle, CardContent } from '@repo/ui/card';
import dynamic from 'next/dynamic';

const NotesWidget = dynamic(() => import('notes_widget/Widget'), {
  ssr: false,
});
const AnalyticsWidget = dynamic(() => import('analytics_widget/Widget'), {
  ssr: false,
});
const AiChatWidget = dynamic(() => import('ai_chat/Widget'), {
  ssr: false,
});

declare global {
  interface Window {
    eventBus: Emitter;
  }
}

export default function Home() {
  const [eventBus, setEventBus] = useState<Emitter | null>(null);

  useEffect(() => {
    if (!window.eventBus) window.eventBus = new Emitter();
    setEventBus(window.eventBus);
  }, []);

  if (!eventBus) return <p>Loading Dashboard...</p>;

  return (
    <main className='flex min-h-screen flex-col items-center p-12 bg-gray-100'>
      <h1 className='text-4xl font-bold mb-8'>Modular Dashboard</h1>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-7xl'>
        <Card>
          <CardHeader>
            <CardTitle>Analytics Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<p>Loading...</p>}>
              <AnalyticsWidget eventBus={eventBus} />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<p>Loading...</p>}>
              <AiChatWidget eventBus={eventBus} />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Real-time Log</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<p>Loading...</p>}>
              <NotesWidget eventBus={eventBus} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
