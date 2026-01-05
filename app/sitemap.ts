import { MetadataRoute } from "next";
import { requirements } from "@/data/requirements";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://necesitovisa.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/visa`, lastModified: new Date() },
  ];

  const dynamicRoutes: MetadataRoute.Sitemap = requirements.map((req) => ({
    url: `${baseUrl}/visa/${req.originSlug}/${req.destSlug}`,
    lastModified: new Date(req.lastReviewed),
  }));

  return [...staticRoutes, ...dynamicRoutes];
}
