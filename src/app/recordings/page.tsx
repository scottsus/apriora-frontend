"use client";

import { getRecording } from "~/actions/aws";
import { useEffect, useState } from "react";

import { useVideoControl, Video } from "./video";

export default function RecordingsPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const { videoRef, jumpToTime } = useVideoControl();

  useEffect(() => {
    getRecording("mixed.mp4").then(setVideoUrl);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {videoUrl && (
        <>
          <Video url={videoUrl} ref={videoRef} />
          <div className="flex space-x-4">
            <button
              onClick={() => jumpToTime(5)}
              className="rounded bg-blue-500 px-4 py-2 text-white"
            >
              5s
            </button>
            <button
              onClick={() => jumpToTime(10)}
              className="rounded bg-blue-500 px-4 py-2 text-white"
            >
              10s
            </button>
            <button
              onClick={() => jumpToTime(15)}
              className="rounded bg-blue-500 px-4 py-2 text-white"
            >
              15s
            </button>
          </div>
        </>
      )}
    </div>
  );
}
// export default async function RecordingsPage() {
//   const videoUrls = await listRecordings();

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="mb-6 text-3xl font-bold">Recordings</h1>
//       {videoUrls.map((url) => (
//         <div key={url} className="mb-6">
//           <video className="w-full max-w-2xl" controls>
//             <source src={url} type="video/webm" />
//           </video>
//         </div>
//       ))}
//     </div>
//   );
// }
