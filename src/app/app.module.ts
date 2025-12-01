import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { RequestListComponent } from './request-list/request-list.component';
import { TraceViewerComponent } from './trace-viewer/trace-viewer.component';
import { LogViewerComponent } from './log-viewer/log-viewer.component';
import { FlamegraphComponent } from './flamegraph/flamegraph.component';
import { FlowchartComponent } from './flowchart/flowchart.component';
import { TraceLogsComponent } from './trace-logs/trace-logs.component';
import { RequestService } from './services/request.service';

@NgModule({
  declarations: [
    AppComponent,
    RequestListComponent,
    TraceViewerComponent,
    LogViewerComponent,
    FlamegraphComponent,
    FlowchartComponent,
    TraceLogsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule
  ],
  providers: [RequestService],
  bootstrap: [AppComponent]
})
export class AppModule { }

