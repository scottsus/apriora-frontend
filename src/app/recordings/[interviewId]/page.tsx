import { getRecording, getTranscript } from "~/actions/postgres";
import { getRecordingUrl } from "~/actions/s3";
import { Button } from "~/components/button";
import { HomeButton } from "~/components/buttons";
import Link from "next/link";

import { Replay } from "../replay";

export default async function RecordingsPage({
  params,
}: {
  params: { interviewId: number };
}) {
  const recording = await getRecording({ interviewId: params.interviewId });
  const recordingUrl = await getRecordingUrl(recording?.s3FileName ?? "");
  const transcripts = await getTranscript({ interviewId: params.interviewId });

  return (
    <main className="-mt-14 flex h-full flex-col items-center justify-center">
      {recording ? (
        <div className="flex flex-col items-center gap-y-2">
          <Replay url={recordingUrl} transcripts={transcripts} />
          <HomeButton>Home</HomeButton>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-y-4">
          <h1 className="text-4xl">
            that&apos;s it! your video is now processing
          </h1>
          <p className="text-xl text-gray-700">
            meanwhile, please check the gallery to see all the processed videos
          </p>
          <Link href="/recordings">
            <Button variant="primary" className="mt-8 px-6 py-3 text-2xl">
              Gallery
            </Button>
          </Link>
        </div>
      )}
    </main>
  );
}
