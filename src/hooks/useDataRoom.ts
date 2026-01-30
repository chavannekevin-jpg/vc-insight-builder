import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DataRoom, DataRoomFile, DataRoomMessage, DataRoomMemo, DataRoomSource } from "@/types/dataRoom";

// Helper to safely cast DB rows to our types
function mapDataRoom(row: any): DataRoom {
  return {
    ...row,
    summary_json: row.summary_json as DataRoomMemo | null,
  };
}

function mapDataRoomMessage(row: any): DataRoomMessage {
  return {
    ...row,
    sources: row.sources as DataRoomSource[] | null,
  };
}

export function useDataRooms(investorId: string | null) {
  return useQuery({
    queryKey: ["data-rooms", investorId],
    queryFn: async () => {
      if (!investorId) return [];
      
      const { data, error } = await supabase
        .from("investor_data_rooms")
        .select("*")
        .eq("investor_id", investorId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return (data || []).map(mapDataRoom);
    },
    enabled: !!investorId,
  });
}

export function useDataRoom(roomId: string | null) {
  return useQuery({
    queryKey: ["data-room", roomId],
    queryFn: async () => {
      if (!roomId) return null;
      
      const { data, error } = await supabase
        .from("investor_data_rooms")
        .select("*")
        .eq("id", roomId)
        .single();
      
      if (error) throw error;
      return mapDataRoom(data);
    },
    enabled: !!roomId,
  });
}

export function useDataRoomFiles(roomId: string | null) {
  return useQuery({
    queryKey: ["data-room-files", roomId],
    queryFn: async () => {
      if (!roomId) return [];
      
      const { data, error } = await supabase
        .from("investor_data_room_files")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data as DataRoomFile[];
    },
    enabled: !!roomId,
  });
}

export function useDataRoomMessages(roomId: string | null) {
  return useQuery({
    queryKey: ["data-room-messages", roomId],
    queryFn: async () => {
      if (!roomId) return [];
      
      const { data, error } = await supabase
        .from("investor_data_room_messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return (data || []).map(mapDataRoomMessage);
    },
    enabled: !!roomId,
  });
}

export function useCreateDataRoom(investorId: string | null) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (companyName: string) => {
      if (!investorId) throw new Error("No investor ID");
      
      const { data, error } = await supabase
        .from("investor_data_rooms")
        .insert({
          investor_id: investorId,
          company_name: companyName,
          status: "uploading",
        } as any)
        .select()
        .single();
      
      if (error) throw error;
      return mapDataRoom(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-rooms", investorId] });
    },
  });
}

export function useUpdateDataRoomStatus(investorId: string | null) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ roomId, status, summaryJson }: { 
      roomId: string; 
      status: DataRoom['status'];
      summaryJson?: DataRoomMemo;
    }) => {
      const update: Record<string, unknown> = { 
        status, 
        updated_at: new Date().toISOString() 
      };
      
      if (summaryJson) {
        update.summary_json = summaryJson;
      }
      
      const { error } = await supabase
        .from("investor_data_rooms")
        .update(update)
        .eq("id", roomId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["data-rooms", investorId] });
      queryClient.invalidateQueries({ queryKey: ["data-room", variables.roomId] });
    },
  });
}

export function useAddDataRoomFile(roomId: string | null) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: Omit<DataRoomFile, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from("investor_data_room_files")
        .insert(file)
        .select()
        .single();
      
      if (error) throw error;
      return data as DataRoomFile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-room-files", roomId] });
    },
  });
}

export function useUpdateFileStatus(roomId: string | null) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      fileId, 
      status, 
      extractedText,
      pageCount 
    }: { 
      fileId: string; 
      status: DataRoomFile['extraction_status'];
      extractedText?: string;
      pageCount?: number;
    }) => {
      const update: Record<string, unknown> = { extraction_status: status };
      if (extractedText !== undefined) update.extracted_text = extractedText;
      if (pageCount !== undefined) update.page_count = pageCount;
      
      const { error } = await supabase
        .from("investor_data_room_files")
        .update(update)
        .eq("id", fileId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-room-files", roomId] });
    },
  });
}

export function useAddMessage(roomId: string | null) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (message: Omit<DataRoomMessage, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from("investor_data_room_messages")
        .insert(message as any)
        .select()
        .single();
      
      if (error) throw error;
      return mapDataRoomMessage(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-room-messages", roomId] });
    },
  });
}

export function useDeleteDataRoom(investorId: string | null) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (roomId: string) => {
      // Delete files from storage first
      const { data: files } = await supabase
        .from("investor_data_room_files")
        .select("storage_path")
        .eq("room_id", roomId);
      
      if (files?.length) {
        const paths = files.map(f => f.storage_path);
        await supabase.storage.from("data-room-files").remove(paths);
      }
      
      // Delete the room (cascades to files and messages)
      const { error } = await supabase
        .from("investor_data_rooms")
        .delete()
        .eq("id", roomId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-rooms", investorId] });
    },
  });
}
