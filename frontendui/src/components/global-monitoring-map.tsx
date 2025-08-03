"use client";
import { motion } from "motion/react";
import { WorldMap } from "./ui/world-map";

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
            className="font-bold text-3xl md:text-5xl dark:text-white text-black mb-4"
            initial={{ opacity: 0.8, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            Monitor From{" "}
            <span className="text-green-600 dark:text-green-400">
              Every Corner
            </span>{" "}
            of the World
          </motion.h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our distributed monitoring network spans across 6 continents,
            providing comprehensive uptime monitoring from multiple geographic
            locations. Get real-time insights into your website's performance
            from your users' perspective.
          </p>
        </div>

        {/* Monitoring Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="text-center p-4 bg-white/90 dark:bg-slate-800/90 rounded-lg border border-green-200 dark:border-green-800/30">
            <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
              15+
            </div>
            <div className="text-sm text-muted-foreground">
              Global Locations
            </div>
          </div>
          <div className="text-center p-4 bg-white/90 dark:bg-slate-800/90 rounded-lg border border-blue-200 dark:border-blue-800/30">
            <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
              30s
            </div>
            <div className="text-sm text-muted-foreground">Check Interval</div>
          </div>
          <div className="text-center p-4 bg-white/90 dark:bg-slate-800/90 rounded-lg border border-purple-200 dark:border-purple-800/30">
            <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">
              99.9%
            </div>
            <div className="text-sm text-muted-foreground">Uptime SLA</div>
          </div>
          <div className="text-center p-4 bg-white/90 dark:bg-slate-800/90 rounded-lg border border-orange-200 dark:border-orange-800/30">
            <div className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400">
              &lt;1s
            </div>
            <div className="text-sm text-muted-foreground">Alert Speed</div>
          </div>
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
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            className="group relative rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-green-200/50 dark:border-green-800/30 p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            initial={{ opacity: 0.8, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />
              </div>
            </div>

            <h3 className="font-bold text-xl mb-4 text-gray-900 dark:text-white">
              Real-Time Monitoring
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Continuous monitoring from multiple locations ensures we catch
              downtime instantly, no matter where your users are.
            </p>
          </motion.div>

          <motion.div
            className="group relative rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-blue-200/50 dark:border-blue-800/30 p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            initial={{ opacity: 0.8, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-2xl">🌐</span>
            </div>

            <h3 className="font-bold text-xl mb-4 text-gray-900 dark:text-white">
              Global Perspective
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              See how your website performs from different continents and
              identify regional performance issues.
            </p>
          </motion.div>

          <motion.div
            className="group relative rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-purple-200/50 dark:border-purple-800/30 p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            initial={{ opacity: 0.8, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-2xl">⚡</span>
            </div>

            <h3 className="font-bold text-xl mb-4 text-gray-900 dark:text-white">
              Instant Alerts
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Get notified within seconds when any monitoring location detects
              an issue with your website.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}