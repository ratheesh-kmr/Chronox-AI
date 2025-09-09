import React, { useRef, useState } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { motion } from 'framer-motion';

export default function JitsiPanel({
  projectId,
  projectName = 'Chronox Meeting',
  displayName = 'Guest',
  domain = undefined, // optional - defaults to meet.jit.si
}) {
  const [open, setOpen] = useState(false);
  const externalApiRef = useRef(null);
  const iframeRef = useRef(null);

  // sanitize/normalize room name if needed
  const roomName = `Chronox-Project-${String(projectId).replace(/\s+/g, '-').toLowerCase()}`;

  function handleClose() {
    // If external API available, hang up first
    if (externalApiRef.current && typeof externalApiRef.current.executeCommand === 'function') {
      try { externalApiRef.current.executeCommand('hangup'); } catch (e) { /* ignore */ }
    }
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-600 text-white text-sm shadow-md hover:bg-indigo-500"
        aria-label={`Join meeting for ${projectName}`}>
        Join Meeting
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            className="relative w-full max-w-6xl h-[80vh] bg-white rounded-lg shadow-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div>
                <h3 className="text-sm font-semibold">{projectName}</h3>
                <p className="text-xs text-slate-500">Room: <span className="font-mono">{roomName}</span></p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (externalApiRef.current && typeof externalApiRef.current.executeCommand === 'function') {
                      try { externalApiRef.current.executeCommand('toggleVideo'); } catch (e) {}
                    }
                  }}
                  className="px-3 py-1 rounded bg-slate-100 text-sm">Toggle Video</button>

                <button onClick={handleClose} className="px-3 py-1 rounded bg-red-500 text-white text-sm">Close</button>
              </div>
            </div>

            {/* Jitsi Meeting */}
            <div className="w-full h-[calc(100%-56px)]">
              <JitsiMeeting
                // optional: set custom domain if you self-host
                domain={domain}

                // room name (required)
                roomName={roomName}

                // user info
                userInfo={{ displayName }}

                // get DOM iframe ref for fine-grained styling/control
                getIFrameRef={(node) => {
                  iframeRef.current = node;
                  if (node) {
                    node.style.height = '100%';
                    node.style.width = '100%';
                    node.style.border = '0';
                  }
                }}

                // when external API is ready you'll receive the object here
                onApiReady={(externalApi) => {
                  externalApiRef.current = externalApi;
                  // example: externalApi.executeCommand('subject', 'Chronox - ' + projectName)
                }}

                // called when meeting requests to close
                onReadyToClose={() => handleClose()}

                // optional: tweak defaults
                configOverwrite={{ startWithAudioMuted: true, startWithVideoMuted: true }}
                interfaceConfigOverwrite={{ SHOW_JITSI_WATERMARK: false }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}