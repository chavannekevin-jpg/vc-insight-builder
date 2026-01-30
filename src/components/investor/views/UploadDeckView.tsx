import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UploadModeSelector } from "../dataroom/UploadModeSelector";
import { DataRoomUpload } from "../dataroom/DataRoomUpload";
import { DataRoomAnalysisView } from "../dataroom/DataRoomAnalysisView";
import { QuickDeckReview } from "./QuickDeckReview";
import type { DataRoomMemo } from "@/types/dataRoom";

interface UploadDeckViewProps {
  investorId?: string;
}

const UploadDeckView = ({ investorId }: UploadDeckViewProps = {}) => {
  const [mode, setMode] = useState<'deck' | 'dataroom' | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  const handleSaveToDealflow = async (roomId: string, memo: DataRoomMemo) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get the room details
      const { data: room } = await supabase
        .from("investor_data_rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      if (!room) throw new Error("Room not found");

      // Create a deck company record to store the memo
      const { data: deckCompany, error: deckCompanyError } = await supabase
        .from("investor_deck_companies")
        .insert([{
          investor_id: user.id,
          name: memo.company_name || room.company_name,
          stage: "Unknown",
          description: memo.executive_summary?.slice(0, 500) || null,
          category: null,
          memo_json: memo as any,
        }])
        .select("id")
        .single();

      if (deckCompanyError) throw deckCompanyError;
      if (!deckCompany?.id) throw new Error("Failed to create deck company");

      // Add to dealflow
      const { error: dealflowError } = await supabase.from("investor_dealflow").insert({
        investor_id: user.id,
        deck_company_id: deckCompany.id,
        company_id: null,
        source: "deck_upload",
        status: "reviewing",
      } as any);

      if (dealflowError) throw dealflowError;

      toast({
        title: "Added to dealflow",
        description: "The analysis has been saved to your dealflow.",
      });

      // Reset to mode selection
      setActiveRoomId(null);
      setMode(null);

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save",
        variant: "destructive",
      });
    }
  };

  // If viewing an active data room analysis
  if (activeRoomId && investorId) {
    return (
      <DataRoomAnalysisView
        roomId={activeRoomId}
        investorId={investorId}
        onBack={() => setActiveRoomId(null)}
        onSaveToDealflow={handleSaveToDealflow}
      />
    );
  }

  // If in data room upload mode
  if (mode === 'dataroom' && investorId) {
    return (
      <DataRoomUpload
        investorId={investorId}
        onBack={() => setMode(null)}
        onRoomCreated={(roomId) => setActiveRoomId(roomId)}
      />
    );
  }

  // If in quick deck review mode
  if (mode === 'deck') {
    return (
      <QuickDeckReview
        onBack={() => setMode(null)}
      />
    );
  }

  // Mode selection
  return (
    <UploadModeSelector
      mode={mode}
      onSelect={setMode}
    />
  );
};

export default UploadDeckView;
