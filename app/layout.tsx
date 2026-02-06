import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://get-creative.co';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Intentionally Creative | Beverage Retail Marketing Agency",
    template: "%s | Intentionally Creative",
  },
  description: "The leading marketing agency for liquor stores, wine shops, and beverage retailers. 10+ years in the 3-tier alcohol industry. Geofencing, Google Ads, SEO & more.",
  keywords: [
    "liquor store marketing",
    "beverage retail marketing",
    "alcohol marketing agency",
    "liquor store advertising",
    "wine shop marketing",
    "3-tier beverage marketing",
    "geofencing ads liquor",
    "alcohol retail SEO",
  ],
  authors: [{ name: "Intentionally Creative" }],
  creator: "Intentionally Creative",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Intentionally Creative",
    title: "Intentionally Creative | Beverage Retail Marketing Agency",
    description: "The leading marketing agency for liquor stores, wine shops, and beverage retailers. 10+ years driving growth in the 3-tier alcohol industry.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Intentionally Creative - Beverage Retail Marketing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Intentionally Creative | Beverage Retail Marketing",
    description: "The leading marketing agency for liquor stores and beverage retailers.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
