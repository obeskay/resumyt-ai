import React from "react";
import Head from "next/head";
import { NextSeo } from "next-seo";
import { JsonLd } from "react-schemaorg";
import { FAQPage } from "schema-dts";
import { Locale } from "@/i18n-config";

interface SEOHeadProps {
  dict: any;
  lang: Locale;
}

export const SEOHead: React.FC<SEOHeadProps> = ({ dict, lang }) => (
  <>
    <Head>
      <title>{dict.home?.title ?? "YouTube Video Summaries in Seconds"}</title>
      <meta
        name="description"
        content={
          dict.home?.metaDescription ??
          "Save time and learn faster with intelligent video summaries"
        }
      />
      <meta
        name="keywords"
        content={
          dict.home?.keywords ??
          "YouTube, summaries, video, summarization, learning, education, time-saving"
        }
      />
      <link rel="canonical" href={`https://www.resumyt.com/${lang}`} />
    </Head>
    <NextSeo
      title={dict.home?.title ?? "YouTube Video Summaries in Seconds"}
      description={
        dict.home?.metaDescription ??
        "Save time and learn faster with intelligent video summaries"
      }
      openGraph={{
        type: "website",
        locale: lang === "es" ? "es_ES" : "en_US",
        url: `https://www.resumyt.com/${lang}`,
        site_name: "Resumyt",
        title: dict.home?.title ?? "YouTube Video Summaries in Seconds",
        description:
          dict.home?.metaDescription ??
          "Save time and learn faster with intelligent video summaries",
        images: [
          {
            url: "https://www.resumyt.com/og-image.jpg",
            width: 1200,
            height: 630,
            alt: dict.home?.title ?? "YouTube Video Summaries in Seconds",
          },
        ],
      }}
      twitter={{
        handle: "@resumyt",
        site: "@resumyt",
        cardType: "summary_large_image",
      }}
    />
    <JsonLd<FAQPage>
      item={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: dict.home?.faq?.q1 ?? "What is Resumyt?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                dict.home?.faq?.a1 ??
                "Resumyt is a platform that provides concise and accurate summaries of YouTube videos in seconds.",
            },
          },
          // ... otras preguntas
        ],
      }}
    />
  </>
);
