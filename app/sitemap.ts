import { MetadataRoute } from "next";
import { listAll } from "@/lib/countryIndex";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://necesitovisa.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/visa`, lastModified: new Date() },
  ];

  const countries = listAll();

  const originRoutes: MetadataRoute.Sitemap = countries.map((country) => ({
    url: `${baseUrl}/visa/${country.slug_es}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...originRoutes];
}
