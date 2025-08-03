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
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-600 via-blue-600 to-indigo-600 dark:from-green-400 dark:via-blue-400 dark:to-indigo-400 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              Monitor Your Sites <br />
              <span className="inline-block mt-1 mb-2">From Every Region</span>
            </motion.h1>

            <motion.p 
              className="text-xl text-muted-foreground max-w-2xl mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            >
              Get instant alerts when your website goes down. Monitor from
              multiple locations worldwide and keep your users happy with 24/7
              uptime tracking.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
            >
              <Link
                href="/sign-up"
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-medium text-lg shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 transition-all transform hover:-translate-y-0.5"
              >
                Start Monitoring Free
              </Link>
              <Link
                href="#features"
                className="border-2 border-muted-foreground/20 hover:border-muted-foreground/40 px-8 py-4 rounded-lg font-medium text-lg transition-all hover:bg-muted/20"
              >
                See How It Works
              </Link>
            </motion.div>

            {/* Status Dashboard Preview */}
            <motion.div 
              className="w-full max-w-4xl bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl shadow-2xl p-6"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="font-medium">Live Status Dashboard</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm font-medium">US East</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    98ms
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Response time
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm font-medium">Europe</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    142ms
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Response time
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm font-medium">Asia Pacific</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    234ms
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Response time
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Global Monitoring Map Section */}
        <GlobalMonitoringMap />

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
