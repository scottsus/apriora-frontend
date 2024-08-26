import { getAllRecordings } from "~/actions/postgres";
import { getRecordingUrl } from "~/actions/s3";
import { HomeButton } from "~/components/buttons";
import Link from "next/link";

export default async function RecordingsPage() {
  const recordings = await getAllRecordings();
  const recordingUrls = await Promise.all(
    recordings.map((r) => getRecordingUrl(r.s3FileName)),
  );

  return (
    <main className="flex h-full flex-col items-center justify-center gap-y-4">
      <div className="grid w-full max-w-6xl grid-cols-3 gap-4">
        {recordings.map((r, index) => (
          <Link
            key={r.interviewId}
            href={`/recordings/${r.interviewId}`}
            className="flex flex-col gap-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-all hover:shadow-lg"
          >
            <div className="aspect-video overflow-hidden rounded-lg">
              <video
                src={recordingUrls[index]}
                controls
                className="h-full w-full object-cover"
              />
            </div>
            <p className="w-full text-center text-lg font-medium text-gray-700 hover:underline hover:decoration-apriora-blue hover:decoration-2 hover:underline-offset-4">
              Interview #{r.interviewId}
            </p>
          </Link>
        ))}
      </div>
      <HomeButton>Home</HomeButton>
    </main>
  );
}
