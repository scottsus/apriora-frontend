import { ManagedWebcam } from "~/components/webcam";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="bg-apriora-blue px-40 py-20">
        <ManagedWebcam />
      </div>
    </main>
  );
}
