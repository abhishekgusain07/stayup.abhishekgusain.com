"use client";

import { Sparkles } from "lucide-react";
import config from "@/config";

export default function NotSubscriber() {
  return (
    <div className="flex min-w-screen min-h-screen flex-col pt-[4rem] items-center dark:bg-black bg-white justify-between">
      <h1>Not authorized</h1>

      {config.auth.enabled && config.payments.enabled && (
        <section id="pricing" className="pb-[5rem]">
          {/* <Pricing /> */}
          pricing (turned off for now)
        </section>
      )}
    </div>
  );
}
