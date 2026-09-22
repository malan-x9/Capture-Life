import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard/",
        "/login",
        "/register",
        "/reserve",
      ],
    },
    sitemap: "https://capture-life-murex.vercel.app/sitemap.xml",
  };
}