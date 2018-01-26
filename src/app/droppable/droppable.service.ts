import { Injectable, ComponentFactory, ComponentFactoryResolver } from '@angular/core';
import { DraggableComponent } from '../draggable/draggable.component';
import { DroppableComponent } from './droppable.component';
import { DragAndDropService } from '../drag-and-drop.service';
import { Subscription } from 'rxjs/Subscription';
import { filter, pairwise } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { DragEvent } from '../drag-event';

@Injectable()
export class DroppableService {

  private subscriptions: Subscription[] = [];

  constructor(private dragAndDropService: DragAndDropService) { }

  register(droppable: DroppableComponent): void {
    this.subscriptions.push(
      this.handleDragEvents(droppable),
      this.handleDragOverEvents(droppable),
      this.handleDrop(droppable)
    );
  }

  dragEnterEvents(droppable: DroppableComponent) {
    return this.dragAndDropService.events.pipe(
      filter(e => e.target === droppable),
      filter(e => e.type === 'dragenter')
    );
  }

  dragLeaveEvents(droppable: DroppableComponent) {
    return this.dragAndDropService.events.pipe(
      filter(e => e.target === droppable),
      filter(e => e.type === 'dragleave')
    );
  }

  dragEndEvents(droppable: DroppableComponent) {
    return this.dragAndDropService.events.pipe(
      filter(e => e.type === 'dragend')
    );
  }

  private handleDragEvents(droppable: DroppableComponent): Subscription {
    return this.dragAndDropService.events.pipe(
      filter(e => e.type === 'drag'),
      filter(e => this.isPointerOverDroppable(e.pointerEvent, droppable))
    ).subscribe(e => {
      this.dragAndDropService.dragOver(e.pointerEvent, droppable);
    });
  }

  private handleDragOverEvents(droppable: DroppableComponent): Subscription {
    return this.dragAndDropService.events.pipe(
      this.dragOverPairs()
    ).subscribe(events => {
      if (this.isFirstDragEnterEvent(events, droppable)) {
        this.dragAndDropService.dragEnter(events[0].pointerEvent, droppable);

      } else if (this.isDragLeaveEvent(events, droppable)) {
          this.dragAndDropService.dragLeave(events[1].pointerEvent, droppable);

      } else if (this.isDragEnterEvent(events, droppable)) {
        this.dragAndDropService.dragEnter(events[1].pointerEvent, droppable);
      }
    });
  }

  private isFirstDragEnterEvent(e: DragEvent[], droppable: DroppableComponent) {
    return e.length === 1 && e[0].target === droppable;
  }

  private isDragEnterEvent(e: DragEvent[], droppable: DroppableComponent) {
    return e.length === 2 && e[0].target !== droppable && e[1].target === droppable;
  }

  private isDragLeaveEvent(e: DragEvent[], droppable: DroppableComponent) {
    return e.length === 2 && e[0].target === droppable && e[1].target !== droppable;
  }

  private handleDrop(droppable: DroppableComponent): Subscription {
    return this.dragAndDropService.events.pipe(
      filter(e => e.type === 'dragend'),
      filter(e => e.target === droppable)
    ).subscribe(e => {
      // remove draggable from current host
      const i = e.draggable.host.viewContainerRef.indexOf(e.draggable.componetRef.hostView);
      if (i > -1) {
        e.draggable.host.viewContainerRef.detach(i);
      }
      // add draggable to new host
      e.target.viewContainerRef.insert(e.draggable.componetRef.hostView);
      e.draggable.host = e.target;
    });
  }

  private dragOverPairs() {
    return (source: Observable<DragEvent>) => {
      let sub: Subscription;
      let last: DragEvent;

      return new Observable<DragEvent[]>(subscriber => {
        sub = source.subscribe(e => {
          if (e.type === 'dragstart') {
            last = undefined;

          } else if (e.type === 'dragover') {
            if (last) {
              subscriber.next([last, e]);
            } else {
              subscriber.next([e]);
            }
            last = e;
          }
        });

        // on unsubscribe
        return () => sub.unsubscribe();
      });
    };
  }

  private isPointerOverDroppable(e: PointerEvent, droppable: DroppableComponent): boolean {
    const el: ClientRect = droppable.elementRef.nativeElement.getBoundingClientRect();
    return e.clientX >= el.left && e.clientX <= (el.left + el.width) &&
    e.clientY >= el.top && e.clientY <= (el.top + el.height);
  }
}
