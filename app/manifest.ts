import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ORBE — Jardins vivants",
    short_name: "ORBE",
    description: "Conception, création et soin de jardins durables.",
    start_url: "/",
    display: "standalone",
    background_color: "#f1f0e8",
    theme_color: "#102219",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
