"use client";

import { messages } from "~/server/db/schema";
import { InferInsertModel } from "drizzle-orm";
import { useEffect, useRef, useState } from "react";

type Message = InferInsertModel<typeof messages>;

export function useConversation() {
  const scrollRef = useRef<HTMLUListElement>(null);
  const [conversation, setConversation] = useState<Message[]>([]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation]);

  return { conversation, setConversation, scrollRef };
}
