import { Component, OnInit, OnDestroy, ComponentRef, ViewChild, ViewContainerRef,
  HostBinding, ElementRef, Renderer2 } from '@angular/core';
import {  DraggableService } from './draggable.service';
import { DroppableComponent } from '../droppable/droppable.component';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-draggable',
  templateUrl: './draggable.component.html',
  styleUrls: ['./draggable.component.scss'],
  providers: [
    DraggableService
  ]
})
export class DraggableComponent implements OnInit, OnDestroy {

  @ViewChild('vc', { read: ViewContainerRef })
  viewContainerRef: ViewContainerRef;

  @HostBinding('style.width')
  width: string;

  @HostBinding('style.height')
  height: string;

  componetRef: ComponentRef<DraggableComponent>;

  droppable: DroppableComponent;

  shadow: HTMLElement;

  content: ComponentRef<any>;

  candidate: Observable<boolean>;

  private subs: Subscription[] = [];

  constructor(private renderer: Renderer2,
    private elementRef: ElementRef,
    private draggableService: DraggableService) { }

  ngOnInit() {
    this.draggableService.register(this);
    this.subs.push(
      this.handleDragStart(),
      this.handleDragEnd()
    );
    this.candidate = this.draggableService.candidate;
  }

  detatch(): void {
    this.droppable.viewContainerRef.detach(this.index());
  }

  index(): number {
    return this.droppable.viewContainerRef.indexOf(this.componetRef.hostView);
  }

  insert(droppable: DroppableComponent, index?: number): void {
    droppable.viewContainerRef.insert(this.componetRef.hostView, index);
    this.droppable = droppable;
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  private handleDragStart(): Subscription {
    return this.draggableService.dragStart.subscribe(e => {
      const el: HTMLElement = this.elementRef.nativeElement;
      this.width = el.offsetWidth + 'px';
      this.height = el.offsetHeight + 'px';

      this.clearSelection(e.draggable.componetRef.location.nativeElement);
      this.removeShadow(e.draggable.shadow);
      this.createShadow(this.content.location.nativeElement);
      this.insertShadow(
        e.draggable.componetRef.location.nativeElement,
        e.draggable.shadow
      );

      // TODO:  Investigate removing the timeout and not causing
      //        a flicker in a list of draggables. The current
      //        value of 64ms was determined experimentally.
      setTimeout(() => {
        this.height = null;
        this.width = null;
      }, 64);
    });
  }

  private handleDragEnd(): Subscription {
    return this.draggableService.dragEnd.subscribe(e => {
      this.removeShadow(e.draggable.shadow);
    });
  }

  private createShadow(el: HTMLElement): void {
    this.shadow = el.cloneNode(true) as HTMLElement;
    this.renderer.addClass(this.shadow, 'shadow');
  }

  private insertShadow(draggable: HTMLElement, shadow: HTMLElement) {
    this.renderer.appendChild(draggable, shadow);
  }

  private removeShadow(shadow: HTMLElement) {
    if (shadow) {
      this.renderer.removeChild(shadow.parentNode, shadow);
      this.shadow = null;
    }
  }

  private clearSelection(draggable: HTMLElement): void {
    const selection = window.getSelection();
    if (selection.containsNode(draggable, true)) {
      selection.empty();
    }
  }
}
