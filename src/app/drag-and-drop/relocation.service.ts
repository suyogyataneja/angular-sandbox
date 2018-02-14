import { Injectable, OnDestroy } from '@angular/core';
import { DragAndDropService } from './drag-and-drop.service';
import { Subscription } from 'rxjs/Subscription';
import { map, filter } from 'rxjs/operators';
import { RelocationEvent } from './relocation-event';

@Injectable()
export class RelocationService implements OnDestroy {

  private subs: Subscription[] = [];

  constructor(private dragAndDropService: DragAndDropService) { }

  init() {
    this.subs.push(
      this.handleDragEnter()
    );
  }

  private handleDragEnter(): Subscription {
    return this.dragAndDropService.dragEnter.pipe(
      map(e => {
        const target = e.dropZone.location();
        let index = target.index;

        if (index) {
          // adjust the index if the draggable is currently located before the drop-zone
          // in the same container, i.e. if that's the case, the index of the drop-zone
          // will be reduced by one when the draggable is removed from its current location.
          if (target.droppable === e.draggable.droppable && e.draggable.index() < index) {
            index -= 1;
          }
        }
        return new RelocationEvent(e.pointerEvent, e.draggable, target.droppable, index);
      }),
      filter(e => {
        return !(e.draggable.droppable === e.droppable && e.draggable.index() === e.index);
      })
    ).subscribe(e => this.moveDraggable(e));
  }

  private moveDraggable(e: RelocationEvent): void {
    e.draggable.detatch();
    e.draggable.insert(e.droppable, e.index);
    this.dragAndDropService.emitDrop(e.pointerEvent, e.draggable);
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}
