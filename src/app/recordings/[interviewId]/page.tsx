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
    <div className="container mx-auto px-4 py-8">
      <Replay url={recordingUrl} transcripts={transcripts} />
    </div>
  );
}
