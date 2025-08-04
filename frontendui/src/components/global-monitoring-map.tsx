"use client";
import { motion } from "motion/react";
import { WorldMap } from "./ui/world-map";
import { BenefitsHyper } from "./ui/Benifits";

export function GlobalMonitoringMap() {
  return (
    <div className="h-full">
      <div className="max-w-7xl mx-auto h-full">
        {/* World Map */}
        <motion.div 
          className="relative h-full"
          initial={{ opacity: 0.8, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <WorldMap
            dots={[
              {
                start: { lat: 37.7749, lng: -122.4194 }, // San Francisco
                end: { lat: 40.7128, lng: -74.006 }, // New York
              },
              {
                start: { lat: 40.7128, lng: -74.006 }, // New York
                end: { lat: 51.5074, lng: -0.1278 }, // London
              },
              {
                start: { lat: 51.5074, lng: -0.1278 }, // London
                end: { lat: 52.52, lng: 13.405 }, // Berlin
              },
              {
                start: { lat: 51.5074, lng: -0.1278 }, // London
                end: { lat: 35.6762, lng: 139.6503 }, // Tokyo
              },
              {
                start: { lat: 35.6762, lng: 139.6503 }, // Tokyo
                end: { lat: 1.3521, lng: 103.8198 }, // Singapore
              },
              {
                start: { lat: 1.3521, lng: 103.8198 }, // Singapore
                end: { lat: -33.8688, lng: 151.2093 }, // Sydney
              },
              {
                start: { lat: 19.076, lng: 72.8777 }, // Mumbai
                end: { lat: 28.6139, lng: 77.209 }, // New Delhi
              },
              {
                start: { lat: -23.5505, lng: -46.6333 }, // São Paulo
                end: { lat: -34.6037, lng: -58.3816 }, // Buenos Aires
              },
            ]}
            lineColor="#22c55e"
          />

          {/* Floating location labels */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[25%] left-[15%] bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium border border-green-200 dark:border-green-800/30">
              🇺🇸 US West
            </div>
            <div className="absolute top-[20%] left-[25%] bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium border border-green-200 dark:border-green-800/30">
              🇺🇸 US East
            </div>
            <div className="absolute top-[18%] left-[45%] bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium border border-green-200 dark:border-green-800/30">
              🇬🇧 London
            </div>
            <div className="absolute top-[15%] left-[48%] bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium border border-green-200 dark:border-green-800/30">
              🇩🇪 Frankfurt
            </div>
            <div className="absolute top-[20%] left-[85%] bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium border border-green-200 dark:border-green-800/30">
              🇯🇵 Tokyo
            </div>
            <div className="absolute top-[45%] left-[75%] bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium border border-green-200 dark:border-green-800/30">
              🇸🇬 Singapore
            </div>
            <div className="absolute top-[65%] left-[82%] bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium border border-green-200 dark:border-green-800/30">
              🇦🇺 Sydney
            </div>
            <div className="absolute top-[45%] left-[25%] bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium border border-green-200 dark:border-green-800/30">
              🇧🇷 São Paulo
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}