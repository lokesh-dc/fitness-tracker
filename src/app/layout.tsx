import { Providers } from "@/components/Providers";
import { Navigation } from "@/components/Navigation";
import "@/app/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <div className="flex-1 pb-24 md:pb-0 md:pl-20">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
