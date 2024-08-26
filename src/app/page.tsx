import { GalleryButton, StartInterviewButton } from "../components/buttons";

export default function HomePage() {
  return (
    <main className="-mt-20 flex h-full flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-y-8">
        <h2 className="w-1/2 text-center text-6xl font-normal leading-tight">
          Hire the{" "}
          <span className="underline decoration-apriora-blue decoration-4 underline-offset-8">
            best
          </span>{" "}
          candidates faster
        </h2>
        <h3 className="w-2/3 text-center text-xl text-gray-600">
          Conduct live interviews with your AI recruiter to screen more
          candidates and make better hiring decisions
        </h3>
        <div className="flex flex-col items-center gap-y-3">
          <StartInterviewButton>Begin Interview</StartInterviewButton>
          <GalleryButton>Gallery</GalleryButton>
        </div>
      </div>
    </main>
  );
}
