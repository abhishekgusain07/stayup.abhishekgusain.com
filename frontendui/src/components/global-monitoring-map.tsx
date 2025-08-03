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

          <h2 className="font-bold text-3xl md:text-5xl dark:text-white text-black mb-4">
            Monitor From{" "}
            <span className="text-green-600 dark:text-green-400">
              {"Every Corner".split("").map((word, idx) => (
                <motion.span
                  key={idx}
                  className="inline-block"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                >
                  {word}
                </motion.span>
              ))}
            </span>{" "}
            of the World
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our distributed monitoring network spans across 6 continents,
            providing comprehensive uptime monitoring from multiple geographic
            locations. Get real-time insights into your website's performance
            from your users' perspective.
          </p>
        </div>

        {/* Monitoring Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <motion.div
            className="text-center p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg border border-green-200 dark:border-green-800/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
              15+
            </div>
            <div className="text-sm text-muted-foreground">
              Global Locations
            </div>
          </motion.div>
          <motion.div
            className="text-center p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg border border-blue-200 dark:border-blue-800/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
              30s
            </div>
            <div className="text-sm text-muted-foreground">Check Interval</div>
          </motion.div>
          <motion.div
            className="text-center p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg border border-purple-200 dark:border-purple-800/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">
              99.9%
            </div>
            <div className="text-sm text-muted-foreground">Uptime SLA</div>
          </motion.div>
          <motion.div
            className="text-center p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg border border-orange-200 dark:border-orange-800/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400">
              &lt;1s
            </div>
            <div className="text-sm text-muted-foreground">Alert Speed</div>
          </motion.div>
        </div>

        {/* World Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative"
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
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            className="text-center p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg border border-green-200 dark:border-green-800/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 bg-green-500 rounded-full animate-pulse" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Real-Time Monitoring</h3>
            <p className="text-muted-foreground text-sm">
              Continuous monitoring from multiple locations ensures we catch
              downtime instantly, no matter where your users are.
            </p>
          </motion.div>

          <motion.div
            className="text-center p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg border border-blue-200 dark:border-blue-800/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 dark:text-blue-400 text-xl">
                🌐
              </span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Global Perspective</h3>
            <p className="text-muted-foreground text-sm">
              See how your website performs from different continents and
              identify regional performance issues.
            </p>
          </motion.div>

          <motion.div
            className="text-center p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg border border-purple-200 dark:border-purple-800/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-purple-600 dark:text-purple-400 text-xl">
                ⚡
              </span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Instant Alerts</h3>
            <p className="text-muted-foreground text-sm">
              Get notified within seconds when any monitoring location detects
              an issue with your website.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
