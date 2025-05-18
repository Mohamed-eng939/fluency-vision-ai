
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface AdminControlsProps {
  onToggleBypass: () => void;
  bypassEnabled: boolean;
  onShowRawScoring: () => void;
  rawScoringEnabled: boolean;
}

const AdminControls: React.FC<AdminControlsProps> = ({
  onToggleBypass,
  bypassEnabled,
  onShowRawScoring,
  rawScoringEnabled
}) => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="h-8 w-8 rounded-full p-0">
            <Settings className="h-4 w-4" />
            <span className="sr-only">Admin Controls</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Developer Controls</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onToggleBypass}>
            {bypassEnabled ? '✓ ' : ''}Bypass Scoring Delay
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onShowRawScoring}>
            {rawScoringEnabled ? '✓ ' : ''}Show Raw Scoring Data
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AdminControls;
