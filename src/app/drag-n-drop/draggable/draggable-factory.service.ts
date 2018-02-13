import { Injectable, ComponentFactoryResolver, Type, ComponentRef } from '@angular/core';
import { DraggableComponent } from './draggable.component';
import { DroppableComponent } from '../droppable/droppable.component';

@Injectable()
export class DraggableFactoryService {

  private factory = this.componentFactoryResolver.resolveComponentFactory(DraggableComponent);

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  addDraggable<T>(component: Type<T>, droppable: DroppableComponent): void {
    // TODO: Investigate eliminating the `setTimeout`
    setTimeout(() => {
      this.createContentComponent(this.createDraggable(droppable).instance, component);
    });
  }

  private createDraggable(droppable: DroppableComponent): ComponentRef<DraggableComponent> {
    const componentRef = droppable.viewContainerRef.createComponent(this.factory);
    componentRef.instance.componetRef = componentRef;
    componentRef.instance.container = droppable;
    return componentRef;
  }

  private createContentComponent<T>(draggable: DraggableComponent, component: Type<T>) {
    const factory = this.componentFactoryResolver.resolveComponentFactory(component);
    const componentRef = draggable.viewContainerRef.createComponent(factory);
    draggable.content = componentRef;
  }
}
