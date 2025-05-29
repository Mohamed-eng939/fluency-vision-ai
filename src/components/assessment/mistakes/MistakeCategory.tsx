
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { MistakeCategory as MistakeCategoryType } from './types';
import MistakeItem from './MistakeItem';
import SummaryStats from './SummaryStats';

interface MistakeCategoryProps {
  category: MistakeCategoryType;
  isOpen: boolean;
  onToggle: () => void;
}

const MistakeCategory: React.FC<MistakeCategoryProps> = ({
  category,
  isOpen,
  onToggle
}) => {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
          <div className="flex items-center gap-3">
            {category.icon}
            <span className="font-medium">{category.name}</span>
            <Badge variant="secondary" className={category.color}>
              {category.mistakes.length} issue{category.mistakes.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          {isOpen ? 
            <ChevronDown className="h-4 w-4" /> : 
            <ChevronRight className="h-4 w-4" />
          }
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="mt-3 space-y-4">
          {category.summaryStats && (
            <SummaryStats summaryStats={category.summaryStats} />
          )}

          {category.mistakes.map((mistake, index) => (
            <MistakeItem key={index} mistake={mistake} index={index} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default MistakeCategory;
