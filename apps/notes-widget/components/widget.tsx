import React, { useEffect, useState } from 'react';
import { Button } from '@repo/ui/button';

interface EventData {
  message: string;
  timestamp: number;
}
interface WidgetProps {
  eventBus: {
    on: (e: string, cb: (d: EventData) => void) => void;
    off: (e: string, cb: (d: EventData) => void) => void;
  };
}

const Widget = ({ eventBus }: WidgetProps) => {
  const [notes, setNotes] = useState<string[]>([]);

  useEffect(() => {
    const handleAnalyticsEvent = (data: EventData) => {
      const newNote = `[${new Date(
        data.timestamp,
      ).toLocaleTimeString()}] [Analytics] ${data.message}`;
      setNotes((prevNotes) => [newNote, ...prevNotes.slice(0, 4)]);
    };

    const handleAiEvent = (data: EventData) => {
      const newNote = `[${new Date(
        data.timestamp,
      ).toLocaleTimeString()}] [AI Insight] ${data.message}`;
      setNotes((prevNotes) => [newNote, ...prevNotes.slice(0, 4)]);
    };

    eventBus.on('analytics:broadcast', handleAnalyticsEvent);
    eventBus.on('ai:insight', handleAiEvent);

    return () => {
      eventBus.off('analytics:broadcast', handleAnalyticsEvent);
      eventBus.off('ai:insight', handleAiEvent);
    };
  }, [eventBus]);

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-grow space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg min-h-[150px]'>
        {notes.length === 0 ? (
          <p className='italic text-gray-400'>
            Waiting for events from other widgets...
          </p>
        ) : (
          notes.map((note, index) => (
            <p
              key={index}
              className={`truncate ${
                note.includes('[AI Insight]') ? 'text-purple-600' : ''
              }`}
            >
              {note}
            </p>
          ))
        )}
      </div>
      <Button
        variant='destructive'
        size='sm'
        onClick={() => setNotes([])}
        className='mt-4 w-full'
      >
        Clear Log
      </Button>
    </div>
  );
};

export default Widget;
