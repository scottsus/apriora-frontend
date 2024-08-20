"use client";

import Image from "next/image";
import Link from "next/link";

export function Navbar() {
  return (
    <div className="flex w-5/6 items-center justify-between p-6">
      <Image src="icon.svg" alt="Apriora" width={230} height={60} />
      <Link
        className="cursor-pointer transition-all hover:opacity-80"
        href="https://github.com/scottsus/apriora"
        target="_blank"
      >
        <Image src="github.svg" alt="GitHub" width={50} height={50} />
      </Link>
    </div>
  );
}
