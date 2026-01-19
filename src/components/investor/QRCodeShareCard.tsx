import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  QrCode, 
  Download, 
  Share2, 
  Calendar, 
  Users, 
  Sparkles,
  Copy,
  Check,
  Smartphone
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface QRCodeShareCardProps {
  profileSlug: string;
  fullName: string;
  inviteCode?: string;
}

const QRCodeShareCard = ({ profileSlug, fullName, inviteCode }: QRCodeShareCardProps) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"booking" | "network">("booking");
  const qrRef = useRef<HTMLDivElement>(null);

  // Build the smart URL - combines booking + network invite
  const bookingUrl = `${window.location.origin}/book/${profileSlug}`;
  const networkUrl = inviteCode 
    ? `${window.location.origin}/investor/auth?code=${inviteCode}`
    : `${window.location.origin}/investor/auth`;
  
  // Combined smart link - booking page with invite code hint
  const smartUrl = inviteCode 
    ? `${bookingUrl}?ref=${inviteCode}`
    : bookingUrl;

  const currentUrl = activeTab === "booking" ? bookingUrl : networkUrl;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    toast({ title: "Link copied!", description: "Share it via any messaging app" });
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
      downloadLink.download = `${fullName.replace(/\s+/g, "-")}-${activeTab}-qr.png`;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    toast({ title: "QR Code downloaded!", description: "Add it to your email signature or business card" });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: activeTab === "booking" 
            ? `Book a meeting with ${fullName}`
            : `Join ${fullName}'s VC Network`,
          text: activeTab === "booking"
            ? `Schedule a time to chat with me`
            : `You've been invited to join my investor network`,
          url: currentUrl,
        });
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-lg bg-primary/10">
            <QrCode className="h-5 w-5 text-primary" />
          </div>
          Conference QR Code
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Let people scan to book time or join your network instantly
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tab Switcher */}
        <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
          <button
            onClick={() => setActiveTab("booking")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === "booking"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            Book Meeting
          </button>
          {inviteCode && (
            <button
              onClick={() => setActiveTab("network")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                activeTab === "network"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Join Network
            </button>
          )}
        </div>

        {/* QR Code Display */}
        <div className="flex flex-col items-center">
          <div 
            ref={qrRef}
            className="p-4 bg-white rounded-2xl shadow-lg border border-border/50"
          >
            <QRCodeSVG
              value={currentUrl}
              size={180}
              level="H"
              includeMargin={false}
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>

          {/* Context Badge */}
          <Badge variant="secondary" className="mt-3 gap-1.5">
            {activeTab === "booking" ? (
              <>
                <Calendar className="h-3 w-3" />
                Scan to book a meeting
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3" />
                Scan to join investor network
              </>
            )}
          </Badge>
        </div>

        {/* URL Preview */}
        <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
          <code className="flex-1 text-xs text-muted-foreground truncate">
            {currentUrl}
          </code>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 flex-shrink-0"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
          <Button size="sm" onClick={handleShare} className="gap-1.5">
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
        </div>

        {/* Pro Tip */}
        <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/10 rounded-lg">
          <Smartphone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Conference tip:</strong> Show this QR code on your phone at events. 
            When scanned, people can instantly book time with you or request to join your network.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeShareCard;
