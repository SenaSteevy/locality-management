"use client"
import { Locality } from "@/types/locality";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

interface Conflict {
  old: Locality;
  new: any;
}

export function ConflictResolver({ 
  conflicts, 
  onComplete 
}: { 
  conflicts: Conflict[], 
  onComplete: (resolved: any[]) => void 
}) {
  const [index, setIndex] = useState(0);
  const [resolvedItems, setResolvedItems] = useState<any[]>([]);

  const current = conflicts[index];

  const handleChoice = (choice: 'old' | 'new') => {
    const updatedList = [...resolvedItems];
    if (choice === 'new') {
      updatedList.push(current.new);
    }
    // If choice is 'old', nothing added since we keep the old item
    
    if (index < conflicts.length - 1) {
      setResolvedItems(updatedList);
      setIndex(index + 1);
    } else {
      onComplete(updatedList);
    }
  };

  return (
    <div className="space-y-4 p-2 border-t mt-4 pt-4">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-amber-600 animate-pulse">
          Conflict {index + 1} of {conflicts.length}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
        <div className="space-y-2">
          <p className="font-bold text-muted-foreground uppercase">Current in DB</p>
          <div className="bg-slate-100 p-2 rounded border truncate h-32 overflow-y-auto">
            {JSON.stringify(current.old, null, 2)}
          </div>
          <Button variant="outline" size="sm" className="w-full text-[10px]" onClick={() => handleChoice('old')}>
            Keep Old
          </Button>
        </div>

        <div className="space-y-2">
          <p className="font-bold text-blue-600 uppercase">Incoming File</p>
          <div className="bg-blue-50 p-2 rounded border border-blue-200 truncate h-32 overflow-y-auto">
            {JSON.stringify(current.new, null, 2)}
          </div>
          <Button size="sm" className="w-full text-[10px]" onClick={() => handleChoice('new')}>
            Update with New
          </Button>
        </div>
      </div>
    </div>
  );
}