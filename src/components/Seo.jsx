import { useEffect } from "react";

function upsertMeta(selector, attrs = {}) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => {
    if (v == null) return;
    el.setAttribute(k, v);
  });
}

export default function Seo({
  title,
  description,
  canonical,
  ogImage,
  ogType = "website",
}) {
  useEffect(() => {
    if (title) document.title = title;

    if (description) {
      upsertMeta('meta[name="description"]', { name: "description", content: description });
      // Open Graph description
      upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
      // (Optional) Twitter description
      upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    }

    // Open Graph title
    if (title) {
      upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
      upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    }

    // OG type
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: ogType });

    // OG image / Twitter image
    if (ogImage) {
      upsertMeta('meta[property="og:image"]', { property: "og:image", content: ogImage });
      upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: ogImage });
      upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    }

    // Canonical
    if (canonical) {
      let link = document.head.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonical);
    }
  }, [title, description, canonical, ogImage, ogType]);

  return null;
}
