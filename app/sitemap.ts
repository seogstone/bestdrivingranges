import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getFeaturedRanges, getPopularCities } from "@/lib/data/ranges";
import { cityToSlug } from "@/lib/utils/city";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.nextPublicSiteUrl;

  const [ranges, cities] = await Promise.all([getFeaturedRanges(5000), getPopularCities(500)]);

  const fixedRoutes = ["", "/ranges", "/map", "/near-me", "/submit"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }));

  const rangeRoutes = ranges.map((range) => ({
    url: `${baseUrl}/range/${range.slug}`,
    lastModified: new Date(range.updated_at || range.created_at),
  }));

  const cityRoutes = cities.map((city) => ({
    url: `${baseUrl}/city/${cityToSlug(city)}`,
    lastModified: new Date(),
  }));

  return [...fixedRoutes, ...rangeRoutes, ...cityRoutes];
}
