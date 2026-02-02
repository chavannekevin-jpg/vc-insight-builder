import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { QrCode, Download, Copy, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminQRGenerator = () => {
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast({ title: "URL copied!", description: "Link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      ctx!.fillStyle = "white";
      ctx!.fillRect(0, 0, 512, 512);
      ctx!.drawImage(img, 0, 0, 512, 512);

      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      const filename = label.trim() 
        ? `${label.trim().replace(/\s+/g, "-")}-qr.png`
        : "qr-code.png";
      downloadLink.download = filename;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    toast({ title: "QR Code downloaded!", description: `Saved as ${label.trim() ? label.trim() + "-qr.png" : "qr-code.png"}` });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">QR Code Generator</h1>
          <p className="text-muted-foreground">Generate QR codes for any URL</p>
        </div>

        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Generate QR Code
            </CardTitle>
            <CardDescription>
              Paste a URL to generate a downloadable QR code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/your-page"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            {/* Label Input */}
            <div className="space-y-2">
              <Label htmlFor="label">Label (optional - for filename)</Label>
              <Input
                id="label"
                type="text"
                placeholder="conference-booth"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>

            {/* QR Code Preview */}
            {url && (
              <div className="flex flex-col items-center space-y-4 pt-4">
                <div
                  ref={qrRef}
                  className="p-4 bg-background rounded-2xl shadow-lg border border-border/50"
                >
                  <QRCodeSVG
                    value={url}
                    size={200}
                    level="H"
                    includeMargin={false}
                    fgColor="#000000"
                    bgColor="#ffffff"
                  />
                </div>

                {/* URL Preview */}
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg w-full">
                  <code className="flex-1 text-xs text-muted-foreground truncate">
                    {url}
                  </code>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 w-full">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    Copy URL
                  </Button>
                  <Button className="flex-1 gap-2" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                    Download PNG
                  </Button>
                </div>
              </div>
            )}

            {!url && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <QrCode className="h-16 w-16 mb-4 opacity-20" />
                <p className="text-sm">Enter a URL to generate QR code</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminQRGenerator;
