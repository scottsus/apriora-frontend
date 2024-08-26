import { getRecording, getTranscript } from "~/actions/postgres";
import { getRecordingUrl } from "~/actions/s3";

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
    <main className="-mt-20 flex h-full flex-col items-center justify-center">
      <Replay url={recordingUrl} transcripts={transcripts} />
    </main>
  );
}
