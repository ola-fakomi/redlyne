import React from 'react';
import { type ChangeSet } from '@/schema';
import { revertChange, revertElement, revertAll } from '@/engine/changeTracker';
import { removePreview, clearAllPreviews } from '@/engine/overlay';
import { Button } from '@/components/ui/button';

interface Props {
  changeSet: ChangeSet;
  onReverted: () => void;
}

export function ChangesTab({ changeSet, onReverted }: Props) {
  const hasChanges = changeSet.elements.some(e => e.changes.length > 0);

  function handleRevertChange(elId: string, changeId: string, property: string) {
    // Find the element to remove the preview
    const elRec = changeSet.elements.find(e => e.element_id === elId);
    if (elRec) {
      const el = document.querySelector(`[data-redlyne-track="${elId}"]`);
      if (el) removePreview(el, property);
    }
    revertChange(elId, changeId);
    onReverted();
  }

  function handleRevertElement(elId: string) {
    const el = document.querySelector(`[data-redlyne-track="${elId}"]`);
    if (el) {
      // Remove all previews for this element
      const elRec = changeSet.elements.find(e => e.element_id === elId);
      elRec?.changes.forEach(c => removePreview(el, c.property));
    }
    revertElement(elId);
    onReverted();
  }

  function handleRevertAll() {
    clearAllPreviews();
    revertAll();
    onReverted();
  }

  if (!hasChanges) {
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-1 text-panel-text-label font-panel">
        <span className="text-panel-sm">No changes yet.</span>
        <span className="text-panel-xs">Select an element and edit its properties.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col font-panel text-panel-sm">
      {/* Revert all */}
      <div className="flex items-center justify-end px-2 py-1 border-b border-panel-border">
        <Button variant="ghost" size="sm" onClick={handleRevertAll} className="text-red-500 hover:text-red-600 hover:bg-panel-revert-hover">
          Revert all
        </Button>
      </div>

      {changeSet.elements.map(elRec => (
        elRec.changes.length === 0 ? null : (
          <div key={elRec.element_id} className="border-b border-panel-border">
            {/* Element header */}
            <div className="flex items-center justify-between px-2 h-[26px] bg-panel-section-bg">
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-panel-xs text-panel-text-label">&lt;{elRec.tag}&gt;</span>
                <span className="text-panel-xs font-medium text-panel-text-primary truncate">{elRec.label}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRevertElement(elRec.element_id)}
                className="text-panel-text-label hover:text-red-500 hover:bg-panel-revert-hover shrink-0"
              >
                Revert
              </Button>
            </div>

            {/* Changes list */}
            {elRec.changes.map(change => (
              <div
                key={change.change_id}
                className="flex items-center gap-1.5 px-2 h-[26px] hover:bg-panel-row-hover group"
              >
                {/* Changed dot */}
                {!change.copied && (
                  <span className="w-1 h-1 rounded-full bg-panel-blue shrink-0" />
                )}
                {change.copied && (
                  <span className="w-1 h-1 rounded-full bg-panel-border shrink-0" />
                )}
                <span className="text-panel-xs text-panel-text-label shrink-0 w-[80px] truncate" title={change.property}>
                  {change.property}
                </span>
                <span className="text-panel-xs text-panel-text-secondary shrink-0 max-w-[50px] truncate" title={change.before.computed}>
                  {change.before.authored ?? change.before.computed}
                </span>
                <span className="text-panel-text-label text-[9px] shrink-0">→</span>
                <span className="text-panel-xs font-medium text-panel-text-primary flex-1 truncate" title={change.after.value}>
                  {change.after.value}
                </span>
                <button
                  onClick={() => handleRevertChange(elRec.element_id, change.change_id, change.property)}
                  className="opacity-0 group-hover:opacity-100 text-[9px] text-panel-text-label hover:text-red-500 shrink-0 px-1"
                  title="Revert this change"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )
      ))}
    </div>
  );
}
