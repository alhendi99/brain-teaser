import { Level, GameItem, SolutionStep, GameState, StepEffect } from '@/types/game';

export class GameEngine {
  private level: Level;
  private state: GameState;
  private onStateChange: (state: GameState) => void;
  private onLevelComplete: (hintsUsed: number) => void;
  private onWrongAction: () => void;
  private onCorrectAction: () => void;

  constructor(
    level: Level,
    initialState: GameState,
    callbacks: {
      onStateChange: (state: GameState) => void;
      onLevelComplete: (hintsUsed: number) => void;
      onWrongAction: () => void;
      onCorrectAction: () => void;
    }
  ) {
    this.level = level;
    this.state = initialState;
    this.onStateChange = callbacks.onStateChange;
    this.onLevelComplete = callbacks.onLevelComplete;
    this.onWrongAction = callbacks.onWrongAction;
    this.onCorrectAction = callbacks.onCorrectAction;
  }

  // Get current expected step
  private getCurrentStep(): SolutionStep | null {
    if (this.state.completedSteps >= this.level.solution.length) {
      return null;
    }
    return this.level.solution[this.state.completedSteps];
  }

  // Handle item click
  handleItemClick(itemId: string): boolean {
    const currentStep = this.getCurrentStep();
    
    if (!currentStep) return false;

    if (currentStep.action === 'click' && currentStep.target === itemId) {
      this.advanceStep(currentStep);
      return true;
    }

    // Check if clicking on a zone
    const zone = this.level.zones.find((z) => z.id === itemId);
    if (zone?.onClick && currentStep.action === 'click' && currentStep.target === zone.id) {
      this.advanceStep(currentStep);
      return true;
    }

    this.onWrongAction();
    return false;
  }

  // Handle zone click
  handleZoneClick(zoneId: string): boolean {
    const currentStep = this.getCurrentStep();
    
    if (!currentStep) return false;

    if (currentStep.action === 'click' && currentStep.target === zoneId) {
      this.advanceStep(currentStep);
      return true;
    }

    this.onWrongAction();
    return false;
  }

  // Handle item drop on zone
  handleItemDrop(itemId: string, zoneId: string): boolean {
    const currentStep = this.getCurrentStep();
    
    if (!currentStep) return false;

    // Check if this is the correct drag action
    if (
      currentStep.action === 'drag' &&
      currentStep.target === itemId &&
      currentStep.destination === zoneId
    ) {
      // Check if zone accepts this item
      const zone = this.level.zones.find((z) => z.id === zoneId);
      if (zone && (!zone.acceptsItems || zone.acceptsItems.includes(itemId))) {
        this.advanceStep(currentStep);
        return true;
      }
    }

    this.onWrongAction();
    return false;
  }

  // Handle item combination
  handleCombine(itemAId: string, itemBId: string): boolean {
    const currentStep = this.getCurrentStep();
    
    if (!currentStep) return false;

    if (currentStep.action === 'combine') {
      const targetItems = currentStep.items || [];
      if (
        (targetItems.includes(itemAId) && targetItems.includes(itemBId)) ||
        (targetItems[0] === itemAId && targetItems[1] === itemBId) ||
        (targetItems[0] === itemBId && targetItems[1] === itemAId)
      ) {
        this.advanceStep(currentStep);
        return true;
      }
    }

    // Also check item's own combinable properties
    const itemA = this.state.items.find((i) => i.id === itemAId);
    if (itemA?.combinableWith?.includes(itemBId)) {
      // Handle combination even if not in current step
      this.applyEffect({
        type: 'hide',
        target: itemAId,
      });
      this.applyEffect({
        type: 'hide',
        target: itemBId,
      });
      if (itemA.combineResult) {
        this.applyEffect({
          type: 'show',
          target: itemA.combineResult,
        });
      }
      return true;
    }

    this.onWrongAction();
    return false;
  }

  // Handle swipe gesture
  handleSwipe(targetId: string, direction: 'left' | 'right' | 'up' | 'down'): boolean {
    const currentStep = this.getCurrentStep();
    
    if (!currentStep) return false;

    if (
      currentStep.action === 'swipe' &&
      currentStep.target === targetId &&
      currentStep.direction === direction
    ) {
      this.advanceStep(currentStep);
      return true;
    }

    this.onWrongAction();
    return false;
  }

  // Advance to next step
  private advanceStep(completedStep: SolutionStep): void {
    // Apply effects
    if (completedStep.effects) {
      completedStep.effects.forEach((effect) => this.applyEffect(effect));
    }

    // Update state
    this.state = {
      ...this.state,
      completedSteps: this.state.completedSteps + 1,
    };

    this.onCorrectAction();
    this.onStateChange(this.state);

    // Check for level completion
    if (this.state.completedSteps >= this.level.solution.length) {
      this.state = { ...this.state, isComplete: true };
      this.onStateChange(this.state);
      this.onLevelComplete(this.state.hintsUsedThisLevel);
    }
  }

  // Apply step effect
  private applyEffect(effect: StepEffect): void {
    switch (effect.type) {
      case 'show':
        this.updateItem(effect.target, { visible: true });
        break;
      case 'hide':
        this.updateItem(effect.target, { visible: false });
        break;
      case 'move':
        if (effect.value) {
          this.updateItem(effect.target, { position: effect.value });
        }
        break;
      case 'transform':
        if (effect.value) {
          this.updateItem(effect.target, effect.value);
        }
        break;
      case 'changeState':
        const item = this.state.items.find((i) => i.id === effect.target);
        if (item?.states && effect.value && item.states[effect.value]) {
          this.updateItem(effect.target, {
            ...item.states[effect.value],
            currentState: effect.value,
          });
        }
        break;
      case 'dialogue':
        // Handle dialogue display
        break;
      case 'sound':
        // Sound is handled by the component
        break;
    }
  }

  // Update item properties
  private updateItem(itemId: string, updates: Partial<GameItem>): void {
    this.state = {
      ...this.state,
      items: this.state.items.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    };
    this.onStateChange(this.state);
  }

  // Get hint
  getHint(language: 'en' | 'ar'): string | null {
    const hints = language === 'ar' ? this.level.hintsAr : this.level.hints;
    const hintIndex = this.state.hintsUsedThisLevel;
    
    if (hintIndex < hints.length) {
      this.state = {
        ...this.state,
        hintsUsedThisLevel: hintIndex + 1,
      };
      this.onStateChange(this.state);
      return hints[hintIndex];
    }
    
    return null;
  }

  // Get current state
  getState(): GameState {
    return { ...this.state };
  }

  // Check if action would be correct (for highlighting)
  wouldBeCorrect(action: string, target: string, destination?: string): boolean {
    const currentStep = this.getCurrentStep();
    if (!currentStep) return false;

    if (action === 'click' && currentStep.action === 'click') {
      return currentStep.target === target;
    }

    if (action === 'drag' && currentStep.action === 'drag') {
      return currentStep.target === target && currentStep.destination === destination;
    }

    return false;
  }
}
