import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { DroppableComponent } from './droppable/droppable.component';
import { DraggableComponent } from './draggable/draggable.component';
import { DraggableFactoryService } from './draggable/draggable-factory.service';
import { DragAreaDirective } from './drag-area.directive';
import { DragAndDropService } from './drag-and-drop.service';
import { ExampleComponent } from './example/example.component';
import { DragScrollDirective } from './drag-scroll/drag-scroll.directive';
import { DragScrollService } from './drag-scroll/drag-scroll.service';
import { GhostService } from './ghost.service';

@NgModule({
  declarations: [
    AppComponent,
    DroppableComponent,
    DraggableComponent,
    DragAreaDirective,
    ExampleComponent,
    DragScrollDirective
  ],
  entryComponents: [
    DraggableComponent,
    ExampleComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    DraggableFactoryService,
    DragAndDropService,
    DragScrollService,
    GhostService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
