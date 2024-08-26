import { getRecording } from "~/actions/aws";
import { getTranscript, getVideo } from "~/actions/interview";

import { Replay } from "../replay";

export default async function RecordingsPage({
  params,
}: {
  params: { interviewId: number };
}) {
  const videoFileName = await getVideo({ interviewId: params.interviewId });
  const videoUrl = await getRecording(videoFileName ?? "");
  const transcripts = await getTranscript({ interviewId: params.interviewId });

  return (
    <div className="container mx-auto px-4 py-8">
      <Replay url={videoUrl} transcripts={transcripts} />
    </div>
  );
}
