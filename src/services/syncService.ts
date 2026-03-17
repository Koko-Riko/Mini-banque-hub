import { supabase } from '@/integrations/supabase/client';
import { offlineStorage, SyncQueueItem } from './offlineStorage';
import { toast } from 'sonner';

const MAX_RETRIES = 3;

class SyncService {
  private isSyncing = false;
  private syncListeners: ((count: number) => void)[] = [];

  onSyncQueueChange(listener: (count: number) => void): () => void {
    this.syncListeners.push(listener);
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== listener);
    };
  }

  private async notifyListeners(): Promise<void> {
    const count = await offlineStorage.getSyncQueueCount();
    this.syncListeners.forEach(listener => listener(count));
  }

  async queueOperation(
    type: 'create' | 'update' | 'delete',
    table: string,
    data: any
  ): Promise<void> {
    await offlineStorage.addToSyncQueue({ type, table, data });
    await this.notifyListeners();
  }

  async syncAll(): Promise<{ success: number; failed: number }> {
    if (this.isSyncing) {
      return { success: 0, failed: 0 };
    }

    this.isSyncing = true;
    let success = 0;
    let failed = 0;

    try {
      const queue = await offlineStorage.getSyncQueue();

      if (queue.length === 0) {
        return { success: 0, failed: 0 };
      }

      toast.info(`Synchronisation de ${queue.length} opération(s)...`);

      for (const item of queue) {
        try {
          await this.processQueueItem(item);
          await offlineStorage.removeFromSyncQueue(item.id);
          success++;
        } catch (error) {
          console.error('Sync error for item:', item, error);
          
          if (item.retries >= MAX_RETRIES) {
            await offlineStorage.removeFromSyncQueue(item.id);
            failed++;
          } else {
            await offlineStorage.updateSyncQueueItem({
              ...item,
              retries: item.retries + 1,
            });
          }
        }
      }

      await this.notifyListeners();

      if (success > 0) {
        toast.success(`${success} opération(s) synchronisée(s)`);
      }
      if (failed > 0) {
        toast.error(`${failed} opération(s) échouée(s)`);
      }

      return { success, failed };
    } finally {
      this.isSyncing = false;
    }
  }

  private async processQueueItem(item: SyncQueueItem): Promise<void> {
    const { type, table, data } = item;

    switch (type) {
      case 'create':
        const { error: insertError } = await supabase
          .from(table as any)
          .insert(data);
        if (insertError) throw insertError;
        break;

      case 'update':
        const { id, ...updateData } = data;
        const { error: updateError } = await supabase
          .from(table as any)
          .update(updateData)
          .eq('id', id);
        if (updateError) throw updateError;
        break;

      case 'delete':
        const { error: deleteError } = await supabase
          .from(table as any)
          .delete()
          .eq('id', data.id);
        if (deleteError) throw deleteError;
        break;
    }
  }

  async refreshCache(): Promise<void> {
    try {
      // Cache accounts
      const { data: accounts } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (accounts) {
        await offlineStorage.cacheAccounts(accounts);
      }

      // Cache recent transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      
      if (transactions) {
        await offlineStorage.cacheTransactions(transactions);
      }

      console.log('Cache refreshed successfully');
    } catch (error) {
      console.error('Error refreshing cache:', error);
    }
  }
}

export const syncService = new SyncService();
