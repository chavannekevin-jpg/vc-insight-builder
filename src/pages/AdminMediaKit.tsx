import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

import logoDark from "@/assets/logos/uglybaby-logo-dark-1.png";
import logoLight from "@/assets/logos/uglybaby-logo-light-1.png";
import logoStacked from "@/assets/logos/uglybaby-logo-stacked-dark.png";
import logoNeon from "@/assets/logos/uglybaby-logo-neon.png";
import logoMonogram from "@/assets/logos/uglybaby-logo-monogram.png";

const logos = [
  { src: logoDark, name: "Primary Dark", desc: "White on black — horizontal layout", file: "uglybaby-logo-dark-1.png" },
  { src: logoLight, name: "Primary Light", desc: "Black on white — horizontal layout", file: "uglybaby-logo-light-1.png" },
  { src: logoStacked, name: "Stacked Bold", desc: "Stacked layout with gold tagline", file: "uglybaby-logo-stacked-dark.png" },
  { src: logoNeon, name: "Neon Glow", desc: "Neon blue glow on dark navy", file: "uglybaby-logo-neon.png" },
  { src: logoMonogram, name: "UB Monogram", desc: "Monogram mark with tagline", file: "uglybaby-logo-monogram.png" },
];

const handleDownload = (src: string, filename: string) => {
  const link = document.createElement("a");
  link.href = src;
  link.download = filename;
  link.click();
};

export default function AdminMediaKit() {
  return (
    <AdminLayout title="Media Kit">
      <div className="space-y-6">
        <div>
          <p className="text-muted-foreground">Brand logos and assets for UglyBaby. Click download to save individual files.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {logos.map((logo) => (
            <Card key={logo.file} className="overflow-hidden">
              <div className="aspect-video bg-muted/30 flex items-center justify-center p-6 border-b">
                <img src={logo.src} alt={logo.name} className="max-h-full max-w-full object-contain" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{logo.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{logo.desc}</p>
                <Button variant="outline" size="sm" onClick={() => handleDownload(logo.src, logo.file)}>
                  <Download className="h-4 w-4 mr-1" /> PNG
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
