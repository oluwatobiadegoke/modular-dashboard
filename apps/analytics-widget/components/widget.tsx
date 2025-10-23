'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';

interface AnalyticsStats {
  pageViews: number;
  signUps: number;
  revenue: number;
}

interface WidgetProps {
  eventBus: { emit: (event: string, ...args: any[]) => void };
}

const Widget = ({ eventBus }: WidgetProps) => {
  const [stats, setStats] = useState<AnalyticsStats>({
    pageViews: 0,
    signUps: 0,
    revenue: 0,
  });

  // This is just to generate random data
  const fetchMockData = () => {
    const newStats = {
      pageViews: Math.floor(Math.random() * 5000) + 1000,
      signUps: Math.floor(Math.random() * 200) + 50,
      revenue: Math.floor(Math.random() * 10000) + 2000,
    };
    setStats(newStats);
    return newStats;
  };

  useEffect(() => {
    fetchMockData();
  }, []);

  const handleRefresh = () => {
    const newStats = fetchMockData();
    const eventData = {
      message: `Analytics data refreshed. New revenue: $${newStats.revenue.toLocaleString()}`,
      timestamp: Date.now(),
    };
    eventBus.emit('analytics:broadcast', eventData);
  };

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'>
        <span className='text-sm font-medium text-gray-600'>Page Views</span>
        <span className='text-lg font-bold text-gray-900'>
          {stats.pageViews.toLocaleString()}
        </span>
      </div>
      <div className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'>
        <span className='text-sm font-medium text-gray-600'>Sign Ups</span>
        <span className='text-lg font-bold text-gray-900'>
          {stats.signUps.toLocaleString()}
        </span>
      </div>
      <div className='flex justify-between items-center p-3 bg-green-50 rounded-lg'>
        <span className='text-sm font-medium text-green-700'>Revenue</span>
        <span className='text-lg font-bold text-green-800'>
          ${stats.revenue.toLocaleString()}
        </span>
      </div>
      <Button onClick={handleRefresh} className='w-full mt-2'>
        Refresh Data
      </Button>
    </div>
  );
};

export default Widget;
