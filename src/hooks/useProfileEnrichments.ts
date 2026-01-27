import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ProfileEnrichment {
  id: string;
  company_id: string;
  source_type: string;
  source_tool: string | null;
  input_data: Record<string, any>;
  target_section_hint: string | null;
  processed: boolean;
  processed_at: string | null;
  created_at: string;
}

interface EnrichmentSyncResult {
  success: boolean;
  synced: number;
  sectionsUpdated: string[];
  error?: string;
}

export function useProfileEnrichments(companyId: string | null) {
  const [pendingEnrichments, setPendingEnrichments] = useState<ProfileEnrichment[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  // Fetch pending (unprocessed) enrichments
  const fetchPendingEnrichments = useCallback(async () => {
    if (!companyId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profile_enrichment_queue')
        .select('*')
        .eq('company_id', companyId)
        .eq('processed', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion since the table is new and not in generated types yet
      setPendingEnrichments((data as unknown as ProfileEnrichment[]) || []);
    } catch (error) {
      console.error('Error fetching enrichments:', error);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Load enrichments on mount
  useEffect(() => {
    fetchPendingEnrichments();
  }, [fetchPendingEnrichments]);

  // Add a new enrichment to the queue
  const addEnrichment = useCallback(async (
    sourceType: string,
    sourceTool: string,
    inputData: Record<string, any>,
    targetSectionHint?: string
  ) => {
    if (!companyId) return false;

    try {
      const { error } = await supabase
        .from('profile_enrichment_queue')
        .insert({
          company_id: companyId,
          source_type: sourceType,
          source_tool: sourceTool,
          input_data: inputData,
          target_section_hint: targetSectionHint || null
        } as any);

      if (error) throw error;
      
      // Refresh the pending list
      await fetchPendingEnrichments();
      return true;
    } catch (error) {
      console.error('Error adding enrichment:', error);
      return false;
    }
  }, [companyId, fetchPendingEnrichments]);

  // Sync all pending enrichments using AI
  const syncEnrichments = useCallback(async (): Promise<EnrichmentSyncResult> => {
    if (!companyId || pendingEnrichments.length === 0) {
      return { success: true, synced: 0, sectionsUpdated: [] };
    }

    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-profile-enrichments', {
        body: { companyId }
      });

      if (error) throw error;

      const result = data as EnrichmentSyncResult;
      
      if (result.success) {
        setLastSyncedAt(new Date().toISOString());
        await fetchPendingEnrichments();
        
        if (result.synced > 0) {
          toast({
            title: "Profile Updated! ✨",
            description: `${result.synced} insights synced to ${result.sectionsUpdated.length} section(s)`
          });
        }
      }

      return result;
    } catch (error: any) {
      console.error('Error syncing enrichments:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Could not sync profile enrichments",
        variant: "destructive"
      });
      return { 
        success: false, 
        synced: 0, 
        sectionsUpdated: [], 
        error: error.message 
      };
    } finally {
      setSyncing(false);
    }
  }, [companyId, pendingEnrichments.length, fetchPendingEnrichments]);

  // Get enrichments grouped by source type
  const getEnrichmentsBySource = useCallback(() => {
    const grouped: Record<string, ProfileEnrichment[]> = {};
    pendingEnrichments.forEach(e => {
      if (!grouped[e.source_type]) {
        grouped[e.source_type] = [];
      }
      grouped[e.source_type].push(e);
    });
    return grouped;
  }, [pendingEnrichments]);

  // Get enrichments grouped by target section
  const getEnrichmentsBySection = useCallback(() => {
    const grouped: Record<string, ProfileEnrichment[]> = {};
    pendingEnrichments.forEach(e => {
      const section = e.target_section_hint || 'unassigned';
      if (!grouped[section]) {
        grouped[section] = [];
      }
      grouped[section].push(e);
    });
    return grouped;
  }, [pendingEnrichments]);

  return {
    pendingEnrichments,
    pendingCount: pendingEnrichments.length,
    loading,
    syncing,
    lastSyncedAt,
    addEnrichment,
    syncEnrichments,
    fetchPendingEnrichments,
    getEnrichmentsBySource,
    getEnrichmentsBySection
  };
}

// Utility hook for adding enrichments from any component
export function useAddEnrichment() {
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const loadCompanyId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .eq('founder_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (companies?.[0]) {
        setCompanyId(companies[0].id);
      }
    };

    loadCompanyId();
  }, []);

  const addEnrichment = useCallback(async (
    sourceType: string,
    sourceTool: string,
    inputData: Record<string, any>,
    targetSectionHint?: string
  ) => {
    if (!companyId) {
      console.warn('No company ID available for enrichment');
      return false;
    }

    try {
      const { error } = await supabase
        .from('profile_enrichment_queue')
        .insert({
          company_id: companyId,
          source_type: sourceType,
          source_tool: sourceTool,
          input_data: inputData,
          target_section_hint: targetSectionHint || null
        } as any);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding enrichment:', error);
      return false;
    }
  }, [companyId]);

  return { addEnrichment, companyId };
}
