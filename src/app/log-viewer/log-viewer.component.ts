import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { RequestService } from '../services/request.service';
import { TraceSpan, LogEntry } from '../models/request.model';

@Component({
  selector: 'app-log-viewer',
  templateUrl: './log-viewer.component.html',
  styleUrls: ['./log-viewer.component.scss']
})
export class LogViewerComponent implements OnInit, OnDestroy {
  selectedSpan: TraceSpan | null = null;
  logs: LogEntry[] = [];
  private subscriptions: Subscription[] = [];

  constructor(private requestService: RequestService) {}

  ngOnInit(): void {
    const sub = this.requestService.getSelectedSpan().subscribe(span => {
      this.selectedSpan = span;
      this.logs = span ? span.logs : [];
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  close(): void {
    this.requestService.selectSpan(null);
  }

  getLogClass(level: string): string {
    return `log-${level}`;
  }

  formatTimestamp(timestamp: number): string {
    const totalMs = Math.round(timestamp);
    const ms = totalMs % 1000;
    const seconds = Math.floor(totalMs / 1000) % 60;
    const minutes = Math.floor(totalMs / 60000) % 60;
    const hours = Math.floor(totalMs / 3600000);
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  }

  formatFields(fields?: { [key: string]: any }): string {
    if (!fields || Object.keys(fields).length === 0) {
      return '';
    }
    return Object.entries(fields)
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join(' ');
  }
}
