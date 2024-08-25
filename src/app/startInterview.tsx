"use client";

import { startInterview } from "~/actions/interview";
import { Button } from "~/components/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function StartInterviewButton({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const onClick = () => {
    startInterview().then((id) => {
      if (!id) {
        toast.error("No interview id. Please try again.");
        return;
      }
      router.push(`interview/${id}`);
    });
  };

  return (
    <Button className="mt-6 rounded-xl px-12 py-4 text-2xl" onClick={onClick}>
      {children}
    </Button>
  );
}
