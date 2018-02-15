import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { RelocationEvent } from './relocation-event';
import { DragAndDropService } from '../drag-and-drop.service';
import { TransientRelocationService } from './transient-relocation.service';

@Injectable()
export class TargetRelocationService {

  readonly relocation = this.dragAndDropService.dragEnter.pipe(
    map(e => {
      let relocation: RelocationEvent = null;
      // if the target draggable is inside a swappable, then we need to move that
      // draggable into the origin location of the transient draggable.
      if (e.dropZone.draggable() !== null && e.dropZone.location().droppable.swappable) {
        const transientOrigin = this.transientRelocationService.origin();

        relocation = new RelocationEvent(
          e.pointerEvent,
          e.dropZone.draggable(),
          transientOrigin.droppable,
          transientOrigin.index
        );
      }
      return relocation;
    })
  );

  constructor(private dragAndDropService: DragAndDropService,
    private transientRelocationService: TransientRelocationService) { }

}
