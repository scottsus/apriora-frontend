import { listRecordings } from "~/actions/aws";

export default async function RecordingsPage() {
  const videoUrls = await listRecordings();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Recordings</h1>
      {videoUrls.map((url) => (
        <div key={url} className="mb-6">
          <video className="w-full max-w-2xl" controls>
            <source src={url} type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>
      ))}
    </div>
  );
}
