import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { DragEvent, DragEventType } from './drag-event';
import { DraggableComponent } from './draggable/draggable.component';
import { DroppableComponent } from './droppable/droppable.component';
import { filter } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class DragNDropService {

  private readonly _events = new Subject<DragEvent>();

  private readonly _isActive = new BehaviorSubject(false);
  readonly isActive = this._isActive.asObservable();

  private draggableInTransit: DraggableComponent;

  private target: DroppableComponent;

  constructor() { }

  events(type?: DragEventType): Observable<DragEvent> {
    if (type) {
      return this._events.pipe(filter(e => e.type === type));
    } else {
      return this._events.asObservable();
    }
  }

  emitDragStart(e: PointerEvent, draggable: DraggableComponent): void {
    this.draggableInTransit = draggable;
    this.target = draggable.container;

    this._isActive.next(true);
    this._events.next(new DragEvent('dragstart', e, draggable, this.target));
  }

  emitDragEnd(e: PointerEvent): void {
    this._events.next(new DragEvent('dragend', e, this.draggableInTransit, this.target));
    this._isActive.next(false);
    this.draggableInTransit = null;
    this.target = null;
  }

  emitDrag(e: PointerEvent): void {
    this._events.next(new DragEvent('drag', e, this.draggableInTransit, this.target));
  }

  emitDragOver(e: PointerEvent, droppable: DroppableComponent): void {
    this.target = droppable;
    this._events.next(new DragEvent('dragover', e, this.draggableInTransit, this.target));
  }

  emitDragEnter(e: PointerEvent, droppable: DroppableComponent): void {
    this._events.next(new DragEvent('dragenter', e, this.draggableInTransit, droppable));
  }

  emitDragLeave(e: PointerEvent, droppable: DroppableComponent): void {
    this._events.next(new DragEvent('dragleave', e, this.draggableInTransit, droppable));
  }
}
