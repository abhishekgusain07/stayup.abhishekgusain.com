"use client";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { NavbarDemo } from "@/components/navbar";
import Pricing from "@/components/pricing";
import Link from "next/link";
import ProblemSection from "./components/problem";
import SolutionSection from "./components/solution";
import Footer from "./components/footer";
import TechnologyUsed from "./components/techused";
import Announcement from "./components/announcement";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import type { LucideIcon } from "lucide-react";
import { useFeedbackModal } from "@/hooks/useFeedbackModal";
import { useUser } from "@/hooks/useUser";
import { GlobalMonitoringMap } from "@/components/global-monitoring-map";

export default function Home() {
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const { user } = useUser();
  const { openFeedbackModal, FeedbackModalComponent } = useFeedbackModal(
    user?.id
  );

  useEffect(() => {
    // Check if the announcement has been dismissed before
    const announcementDismissed = localStorage.getItem(
      "announcement_dismissed"
    );
    if (!announcementDismissed) {
      setShowAnnouncement(true);
    }
  }, []);

  const handleAnnouncementDismiss = () => {
    // Store the dismissal in localStorage so it stays dismissed on refresh
    localStorage.setItem("announcement_dismissed", "true");
    setShowAnnouncement(false);
  };

  const announcement = {
    message: "We value your input! Please",
    link: {
      text: "share your feedback",
      url: "#feedback",
    },
    emoji: "💬",
  };

  // Handler for the announcement link click
  const handleFeedbackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openFeedbackModal();
  };

  const features: Array<{
    title: string;
    description: string;
    link: string;
    icon?: LucideIcon;
  }> = [
    {
      title: "Global Monitoring",
      description:
        "Monitor your websites from multiple regions worldwide including US, Europe, Asia Pacific, and more for comprehensive uptime tracking.",
      link: "#global",
    },
    {
      title: "Instant Alerts",
      description:
        "Get notified immediately when your site goes down via email, SMS, Slack, Discord, or webhook integrations.",
      link: "#alerts",
    },
    {
      title: "Performance Analytics",
      description:
        "Track response times, uptime percentages, and performance metrics with detailed charts and historical data.",
      link: "#analytics",
    },
    {
      title: "Status Pages",
      description:
        "Create beautiful, customizable status pages to keep your users informed about your service availability.",
      link: "#status",
    },
    {
      title: "API Monitoring",
      description:
        "Monitor REST APIs, GraphQL endpoints, and custom HTTP requests with advanced validation and response checks.",
      link: "#api",
    },
    {
      title: "Team Collaboration",
      description:
        "Invite team members, set up on-call rotations, and manage incident response with role-based access control.",
      link: "#team",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
      <Announcement
        show={showAnnouncement}
        message={announcement.message}
        link={announcement.link}
        emoji={announcement.emoji}
        onDismiss={handleAnnouncementDismiss}
        onLinkClick={handleFeedbackClick}
      />
      <NavbarDemo>
        {/* Hero Section */}
        <section className="relative pt-16 pb-16 px-4 md:px-8 lg:px-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 opacity-60" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(34,197,94,0.1),transparent_50%)]" />

          <div className="relative flex flex-col items-center text-center max-w-5xl mx-auto">
            <motion.div 
              className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              99.9% Uptime Guaranteed
            </motion.div>

            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-6 md:mb-8 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              <span className="block text-gray-900 dark:text-white">
                Empowering Reliability
              </span>
              <span className="block mt-1 md:mt-2 bg-clip-text text-transparent bg-gradient-to-r from-green-600 via-blue-600 to-indigo-600 dark:from-green-400 dark:via-blue-400 dark:to-indigo-400">
                Through Global Monitoring
              </span>
            </motion.h1>

            <motion.p 
              className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mb-8 md:mb-10 leading-relaxed px-4 sm:px-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            >
              Discover comprehensive, globally distributed monitoring solutions designed to elevate your website's reliability and user experience journey.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-12 md:mb-16 px-4 sm:px-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
            >
              <Link
                href="/sign-up"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-semibold text-base sm:text-lg shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 text-center"
              >
                Start Monitoring
              </Link>
              <Link
                href="/dashboard"
                className="border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-semibold text-base sm:text-lg transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 text-center"
              >
                Dashboard Portal
              </Link>
            </motion.div>

          </div>
        </section>

        {/* Global Monitoring Map Section */}
        <GlobalMonitoringMap />

        {/* Live Dashboard Preview Section */}
        <section className="py-16 px-4 md:px-8 lg:px-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium mb-6">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Live Dashboard Preview
              </div>
              
              <motion.h2 
                className="font-bold text-3xl md:text-5xl dark:text-white text-black mb-4"
                initial={{ opacity: 0.8, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                Real-Time{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
                  Performance
                </span>{" "}
                Insights
              </motion.h2>

              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                See exactly how your website performs across different regions with live response times, uptime statistics, and detailed monitoring data.
              </p>
            </div>

            {/* Dashboard Preview */}
            <motion.div 
              className="w-full max-w-6xl mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl p-8"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />
                <span className="font-semibold text-lg">Live Status Dashboard</span>
                <div className="ml-auto text-sm text-muted-foreground">
                  Updated 30 seconds ago
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border-2 border-green-200 dark:border-green-800/30 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-sm font-semibold">US East (Virginia)</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                    98ms
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Average response time
                  </div>
                  <div className="mt-3 text-xs text-green-600 dark:text-green-400 font-medium">
                    ✓ 99.98% uptime
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border-2 border-blue-200 dark:border-blue-800/30 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-sm font-semibold">Europe (London)</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    142ms
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Average response time
                  </div>
                  <div className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-medium">
                    ✓ 99.95% uptime
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 border-2 border-purple-200 dark:border-purple-800/30 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full" />
                    <span className="text-sm font-semibold">Asia Pacific (Tokyo)</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    234ms
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Average response time
                  </div>
                  <div className="mt-3 text-xs text-purple-600 dark:text-purple-400 font-medium">
                    ✓ 99.92% uptime
                  </div>
                </div>
              </div>

              {/* Additional metrics */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">15+</div>
                    <div className="text-sm text-muted-foreground">Monitoring Locations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">30s</div>
                    <div className="text-sm text-muted-foreground">Check Frequency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">&lt;1s</div>
                    <div className="text-sm text-muted-foreground">Alert Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">99.9%</div>
                    <div className="text-sm text-muted-foreground">SLA Guarantee</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="py-16 px-4 md:px-8 lg:px-16 bg-secondary/20"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Comprehensive Uptime Monitoring
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to keep your websites running smoothly and
                your users happy
              </p>
            </div>
            <HoverEffect items={features} />
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 px-4 md:px-8 lg:px-16">
          <Pricing />
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Never Miss Another Downtime
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of developers and businesses who trust StayUp to
              monitor their websites 24/7. Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-up"
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-medium text-lg shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 transition-all transform hover:-translate-y-0.5 inline-block"
              >
                Start Free Trial
              </Link>
              <Link
                href="#pricing"
                className="border-2 border-muted-foreground/20 hover:border-muted-foreground/40 px-8 py-4 rounded-lg font-medium text-lg transition-all hover:bg-background/50 inline-block"
              >
                View Pricing
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                No setup fees
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Cancel anytime
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                14-day free trial
              </span>
            </div>
          </div>
        </section>
        <Footer />
      </NavbarDemo>

      {/* Render the feedback modal */}
      <FeedbackModalComponent />
    </div>
  );
}
