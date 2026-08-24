"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface JitsiMeetViewerProps {
  roomName: string;
  displayName?: string;
  email?: string;
  onMeetingEnd?: () => void;
}

export function JitsiMeetViewer({ roomName, displayName = 'Guest', email, onMeetingEnd }: JitsiMeetViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dynamically load Jitsi External API script
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    
    script.onload = () => {
      setLoading(false);
      if (window.JitsiMeetExternalAPI && containerRef.current) {
        const domain = 'meet.jit.si';
        const options = {
          roomName: roomName,
          width: '100%',
          height: '100%',
          parentNode: containerRef.current,
          userInfo: {
            displayName: displayName,
            email: email
          },
          configOverwrite: { 
            startWithAudioMuted: true,
            startWithVideoMuted: true
          },
          interfaceConfigOverwrite: {
            DISABLE_DOMINANT_SPEAKER_INDICATOR: true
          }
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);
        
        api.addListener('readyToClose', () => {
          if (onMeetingEnd) onMeetingEnd();
        });

        api.addListener('videoConferenceLeft', () => {
          if (onMeetingEnd) onMeetingEnd();
        });

        return () => api.dispose();
      }
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [roomName, displayName, email, onMeetingEnd]);

  return (
    <div className="w-full h-full relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 z-10 bg-slate-900">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
          <p className="text-sm font-medium">Connecting to secure meeting server...</p>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full absolute inset-0 z-20" />
    </div>
  );
}
