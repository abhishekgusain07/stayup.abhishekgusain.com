"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, DollarSign, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useUser } from "@/hooks/useUser";

type PricingSwitchProps = {
  onSwitch: (value: string) => void;
};

type PricingCardProps = {
  user: any;
  handleCheckout: any;
  priceIdMonthly: any;
  priceIdYearly: any;
  isYearly?: boolean;
  title: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  description: string;
  features: string[];
  actionLabel: string;
  popular?: boolean;
  exclusive?: boolean;
};

const PricingHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <div className="text-center mb-10">
    {/* Badge */}
    <div className="mx-auto w-fit rounded-full border border-primary/20 bg-primary/10 px-4 py-1 mb-6 backdrop-blur">
      <div className="flex items-center gap-2 text-sm font-medium text-primary">
        <DollarSign className="h-4 w-4" />
        <span>Pricing</span>
      </div>
    </div>

    <h2 className="text-3xl md:text-4xl font-bold pb-2">{title}</h2>
    <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">{subtitle}</p>
  </div>
);

const PricingSwitch = ({ onSwitch }: PricingSwitchProps) => (
  <div className="flex justify-center items-center gap-3">
    <Tabs defaultValue="0" className="w-[400px]" onValueChange={onSwitch}>
      <TabsList className="w-full">
        <TabsTrigger value="0" className="w-full">
          Monthly
        </TabsTrigger>
        <TabsTrigger value="1" className="w-full">
          Yearly
          <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Save 16%
          </span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  </div>
);

const PriceFlip = ({
  isYearly,
  monthly,
  yearly,
}: {
  isYearly: boolean | undefined;
  monthly?: number;
  yearly?: number;
}) => {
  return (
    <div className="relative h-[42px] w-full overflow-hidden">
      <motion.div
        key={isYearly ? "yearly" : "monthly"}
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -24, opacity: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="absolute inset-0 flex items-baseline gap-1"
      >
        <span className="text-4xl font-bold">
          ${isYearly ? yearly : monthly}
        </span>
        <span className="text-muted-foreground">/mo</span>
      </motion.div>
    </div>
  );
};

const PricingCard = ({
  user,
  handleCheckout,
  isYearly,
  title,
  priceIdMonthly,
  priceIdYearly,
  monthlyPrice,
  yearlyPrice,
  description,
  features,
  actionLabel,
  popular,
  exclusive,
}: PricingCardProps) => {
  const router = useRouter();

  // Style tokens per variant
  const theme = useMemo(() => {
    if (popular)
      return {
        glow: "from-violet-500/20 via-fuchsia-500/15 to-indigo-500/10",
        ring: "from-fuchsia-400 to-indigo-400",
        button:
          "bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white hover:opacity-95",
      };
    if (exclusive)
      return {
        glow: "from-amber-500/20 via-orange-500/15 to-rose-500/10",
        ring: "from-amber-400 to-rose-400",
        button:
          "bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:opacity-95",
      };
    return {
        glow: "from-emerald-500/20 via-teal-500/15 to-cyan-500/10",
        ring: "from-emerald-400 to-teal-400",
        button:
          "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-95",
      };
  }, [popular, exclusive]);

  return (
    <div className="group relative h-full">
      {/* Soft ambient glow */}
      <div
        className={cn(
          "pointer-events-none absolute -inset-3 -z-10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          "bg-gradient-to-br",
          theme.glow
        )}
        aria-hidden
      />

      <Card
        className={cn(
          "relative h-full w-full max-w-sm flex flex-col justify-between px-0 py-0 transition-all duration-200 hover:shadow-xl rounded-2xl overflow-hidden",
          "border border-white/30 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl",
          "shadow-[0_8px_28px_rgba(0,0,0,0.08)]",
          popular && "scale-[1.02]"
        )}
      >
        {/* Neon ring edge */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 rounded-2xl opacity-70 mix-blend-soft-light",
            "bg-gradient-to-br",
            theme.ring
          )}
          aria-hidden
        />
        {/* Hairline highlights */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/40 dark:via-white/10 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/40 dark:via-white/10 to-transparent" />

        <div className="p-6 flex flex-col h-full">
          {/* Top ribbon */}
          {(popular || exclusive) && (
            <div className="mb-3 flex justify-center">
              <div className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border backdrop-blur",
                popular
                  ? "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300 border-fuchsia-500/30"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30"
              )}>
                {popular ? (
                  <>
                    <Rocket className="h-4 w-4" />
                    Most Popular
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" />
                    Enterprise
                  </>
                )}
              </div>
            </div>
          )}

          <CardHeader className="space-y-2 pb-4 p-0">
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>

          <CardContent className="pb-4 p-0 pt-4">
            <PriceFlip isYearly={isYearly} monthly={monthlyPrice} yearly={yearlyPrice} />

            <div className="mt-6 space-y-2">
              {features.map((feature) => (
                <div key={feature} className="flex gap-2 items-start">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  <p className="text-muted-foreground">{feature}</p>
                </div>
              ))}
            </div>
          </CardContent>

          <div className="flex-1" />

          <CardFooter className="mt-6 p-0">
            <Button
              onClick={() => {
                if (!user) {
                  router.push("/sign-in");
                  return;
                }
                handleCheckout(isYearly ? priceIdYearly : priceIdMonthly, true);
              }}
              className={cn(
                "w-full transition-transform duration-150 hover:scale-[1.01]",
                (popular || exclusive) ? theme.button : "bg-primary hover:bg-primary/90"
              )}
            >
              {actionLabel}
            </Button>
          </CardFooter>
        </div>
      </Card>
    </div>
  );
};

export default function Pricing() {
  const [isYearly, setIsYearly] = useState<boolean>(false);
  const togglePricingPeriod = (value: string) =>
    setIsYearly(parseInt(value) === 1);
  const { user } = useUser();
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);

  useEffect(() => {
    setStripePromise(loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!));
  }, []);

  const handleCheckout = async (priceId: string, subscription: boolean) => {
    try {
      const { data } = await axios.post(`/api/payments/create-checkout-session`, {
        userId: user?.id,
        email: user?.email,
        priceId,
        subscription,
      });

      if (data.sessionId) {
        const stripe = await stripePromise;
        const response = await stripe?.redirectToCheckout({ sessionId: data.sessionId });
        return response;
      } else {
        console.error("Failed to create checkout session");
        toast("Failed to create checkout session");
        return;
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      toast("Error during checkout");
      return;
    }
  };

  const plans = [
    {
      title: "Starter",
      monthlyPrice: 29,
      yearlyPrice: 24,
      description: "Perfect for indie developers launching their first SaaS project.",
      features: [
        "All core features",
        "Authentication & user management",
        "Basic Stripe integration",
        "Community support",
        "1 team member",
      ],
      priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
      priceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
      actionLabel: "Get Started",
    },
    {
      title: "Pro",
      monthlyPrice: 79,
      yearlyPrice: 66,
      description: "For growing startups that need more power and features.",
      features: [
        "Everything in Starter",
        "Advanced analytics",
        "Multi-tier subscription management",
        "Priority email support",
        "Up to 5 team members",
        "Custom branding",
      ],
      priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
      priceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
      actionLabel: "Upgrade to Pro",
      popular: true,
    },
    {
      title: "Enterprise",
      monthlyPrice: 299,
      yearlyPrice: 249,
      description: "Custom solutions for high-scale SaaS applications.",
      features: [
        "Everything in Pro",
        "Unlimited team members",
        "24/7 dedicated support",
        "Custom integrations",
        "SLA guarantees",
        "White-labeling",
        "Dedicated account manager",
      ],
      priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
      priceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
      actionLabel: "Contact Sales",
      exclusive: true,
    },
  ];

  return (
    <section className="px-4 py-12" id="pricing">
      <div className="max-w-7xl mx-auto">
        <PricingHeader
          title="Simple, Transparent Pricing"
          subtitle="Launch your SaaS faster with plans that scale as you grow."
        />

        {/* Toggle */}
        <PricingSwitch onSwitch={togglePricingPeriod} />

        {/* Ambient section glow */}
        <div
          aria-hidden
          className="relative mx-auto max-w-6xl mt-6"
        >
          <div className="pointer-events-none absolute -inset-x-8 -top-6 h-24 rounded-full bg-gradient-to-r from-emerald-400/10 via-fuchsia-400/10 to-indigo-400/10 blur-2xl" />
        </div>

        {/* Cards grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-10 items-stretch">
          {plans.map((plan) => (
            <PricingCard
              key={plan.title}
              user={user}
              handleCheckout={handleCheckout}
              {...plan}
              isYearly={isYearly}
            />
          ))}
        </div>

        {/* Fine print */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          Cancel anytime. VAT may apply based on your location.
        </div>
      </div>
    </section>
  );
}