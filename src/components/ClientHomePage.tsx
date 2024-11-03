"use client";

import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import MainLayout from "@/components/MainLayout";
import { Toaster } from "@/components/ui/toaster";
import ClientOnly from "./ClientOnly";
import { useHomePageLogic } from "@/hooks/useHomePageLogic";
import { ErrorFallback } from "./home/ErrorFallback";
import { HeroSection } from "./home/HeroSection";
import { FeaturesSection } from "./home/FeaturesSection";
import { HowItWorksSection } from "./home/HowItWorksSection";
import { TestimonialsSection } from "./home/TestimonialsSection";
import { FAQSection } from "./home/FAQSection";
import { CTASection } from "./home/CTASection";
import { SEOHead } from "./home/SEOHead";
import { RecentVideoThumbnails } from "@/components/RecentVideoThumbnails";
import { getFeatures } from "@/lib/features";
import { getFAQs } from "@/lib/faq";
import { getTestimonials } from "@/lib/testimonials";

interface ClientHomePageProps {
  dict: any;
  lang: "en" | "es";
}

const ClientHomePage: React.FC<ClientHomePageProps> = ({ dict, lang }) => {
  const {
    user,
    isSubmitting,
    recentVideos,
    handleSubmit,
    videoInputRef,
    scrollToVideoInput,
  } = useHomePageLogic(dict, lang);

  const features = getFeatures(dict);
  const faqs = getFAQs(dict);
  const testimonials = getTestimonials(dict);

  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => (
        <ErrorFallback error={error} dict={dict} />
      )}
    >
      <SEOHead dict={dict} lang={lang} />
      <ClientOnly>
        <MainLayout>
          <div className="relative min-h-screen flex flex-col justify-center items-center w-full overflow-hidden">
            <div
              style={{
                maskImage:
                  "radial-gradient(circle at center, transparent, black 150%)",
                WebkitMaskImage:
                  "radial-gradient(circle at center, transparent, black 150%)",
              }}
              className="fixed w-full h-[50%] pointer-events-none z-[0] left-0 top-0 opacity-50 dark:opacity-80"
            >
              <RecentVideoThumbnails videoIds={recentVideos} dict={dict} />
            </div>

            <div ref={videoInputRef} className="container mx-auto">
              <HeroSection
                dict={dict}
                user={user}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
              />
              <FeaturesSection dict={dict} features={features} />
              <HowItWorksSection dict={dict} />
              <TestimonialsSection dict={dict} testimonials={testimonials} />
              <CTASection dict={dict} onGetStarted={scrollToVideoInput} />
              <FAQSection dict={dict} faqs={faqs} />
            </div>
          </div>
          <Toaster />
        </MainLayout>
      </ClientOnly>
    </ErrorBoundary>
  );
};

export default ClientHomePage;
