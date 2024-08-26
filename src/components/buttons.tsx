"use client";

import { startInterview } from "~/actions/postgres";
import { Button } from "~/components/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const INTERVIEWEE = "scott";

export function StartInterviewButton({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const onClick = () => {
    startInterview({ interviewee: INTERVIEWEE }).then((res) => {
      if (!res) {
        toast.error("No interview id. Please try again.");
        return;
      }
      router.push(`interview/${res.id}`);
    });
  };

  return (
    <Button className="mt-6 rounded-xl px-12 py-4 text-2xl" onClick={onClick}>
      {children}
    </Button>
  );
}

export function GalleryButton({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const onClick = () => router.push(`/recordings`);

  return (
    <Button
      variant="secondary"
      className="flex-grow-0 text-2xl"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function HomeButton({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const onClick = () => router.push(`/`);

  return (
    <Button
      variant="secondary"
      className="flex-grow-0 text-2xl"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
