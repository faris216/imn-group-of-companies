import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IMN Group of Companies",
    short_name: "IMN Group",
    description: "IMN Builder · INDON Mart · Brightstone Silver & Gemstones",
    start_url: "/",
    display: "standalone",
    background_color: "#01133C",
    theme_color: "#011F5F",
    icons: [{ src: "/icon.png", sizes: "277x112", type: "image/png" }],
  };
}
