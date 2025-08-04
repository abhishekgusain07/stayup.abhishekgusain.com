"use client";
import { motion } from "motion/react";
import { WorldMap } from "./ui/world-map";
import { BenefitsHyper } from "./ui/Benifits";

export function GlobalMonitoringMap() {
  return (
    <div className="py-16 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Global Monitoring Network
          </div>

          <motion.h2 
            className="font-bold text-4xl md:text-6xl dark:text-white text-black mb-6 leading-tight"
            initial={{ opacity: 0.8, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <span className="block">Global Network</span>
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-green-600 via-blue-600 to-indigo-600 dark:from-green-400 dark:via-blue-400 dark:to-indigo-400">
              Monitoring Excellence
            </span>
          </motion.h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our distributed monitoring network spans across 6 continents,
            providing comprehensive uptime monitoring from multiple geographic
            locations. Get real-time insights into your website's performance
            from your users' perspective.
          </p>
        </div>

        {/* Monitoring Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <motion.div 
            className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-2xl border-2 border-green-200/50 dark:border-green-800/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            initial={{ opacity: 0.8, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
          >
            <div className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
              15+
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              Global Locations
            </div>
          </motion.div>
          
          <motion.div 
            className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-2xl border-2 border-blue-200/50 dark:border-blue-800/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            initial={{ opacity: 0.8, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
          >
            <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              30s
            </div>
            <div className="text-sm font-medium text-muted-foreground">Check Interval</div>
          </motion.div>
          
          <motion.div 
            className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-2xl border-2 border-purple-200/50 dark:border-purple-800/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            initial={{ opacity: 0.8, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3, ease: "easeOut" }}
          >
            <div className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              99.9%
            </div>
            <div className="text-sm font-medium text-muted-foreground">Uptime SLA</div>
          </motion.div>
          
          <motion.div 
            className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 rounded-2xl border-2 border-orange-200/50 dark:border-orange-800/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            initial={{ opacity: 0.8, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4, ease: "easeOut" }}
          >
            <div className="text-3xl md:text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              &lt;1s
            </div>
            <div className="text-sm font-medium text-muted-foreground">Alert Speed</div>
          </motion.div>
        </div>

        {/* World Map */}
        <motion.div 
          className="relative"
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

        {/* Benefits */}
        <BenefitsHyper />
      </div>
    </div>
  );
}