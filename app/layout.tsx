import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Bat Barn",
  description:
    "Nobody knows how many bats live in this barn. Watch the barn, stamp what you see, and help count the colony.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
