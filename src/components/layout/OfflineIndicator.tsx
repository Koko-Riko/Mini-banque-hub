import { WifiOff, RefreshCw, Cloud } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOffline } from '@/contexts/OfflineContext';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function OfflineIndicator() {
  const { isOnline, pendingSyncCount, isSyncing, syncNow } = useOffline();

  if (isOnline && pendingSyncCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {!isOnline && (
        <Badge variant="destructive" className="flex items-center gap-1">
          <WifiOff className="h-3 w-3" />
          Hors-ligne
        </Badge>
      )}

      {pendingSyncCount > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Cloud className="h-3 w-3" />
                {pendingSyncCount} en attente
              </Badge>
              {isOnline && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={syncNow}
                  disabled={isSyncing}
                >
                  <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {isOnline
              ? 'Cliquez pour synchroniser maintenant'
              : 'Les modifications seront synchronisées quand la connexion sera rétablie'}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
