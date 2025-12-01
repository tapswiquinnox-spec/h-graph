import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { RequestService } from '../services/request.service';
import { ApiRequest, TraceSpan, LogEntry } from '../models/request.model';

@Component({
  selector: 'app-trace-logs',
  templateUrl: './trace-logs.component.html',
  styleUrls: ['./trace-logs.component.scss']
})
export class TraceLogsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() request: ApiRequest | null = null;
  
  allLogs: Array<{ span: TraceSpan; log: LogEntry; absoluteTime: number }> = [];
  filteredLogs: Array<{ span: TraceSpan; log: LogEntry; absoluteTime: number }> = [];
  selectedSpan: TraceSpan | null = null;
  
  searchQuery: string = '';
  levelFilter: string = 'all';
  serviceFilter: string = 'all';
  
  private subscriptions: Subscription[] = [];

  constructor(private requestService: RequestService) {}

  ngOnInit(): void {
    if (this.request) {
      this.buildLogs(this.request);
    }
    
    const sub = this.requestService.getSelectedSpan().subscribe(span => {
      this.selectedSpan = span;
      this.filterLogs();
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['request'] && this.request) {
      this.buildLogs(this.request);
    }
  }

  buildLogs(request: ApiRequest): void {
    this.allLogs = [];
    
    request.trace.spans.forEach(span => {
      span.logs.forEach(log => {
        this.allLogs.push({
          span,
          log,
          absoluteTime: span.startTime + log.timestamp
        });
      });
    });
    
    // Sort by absolute time
    this.allLogs.sort((a, b) => a.absoluteTime - b.absoluteTime);
    this.filterLogs();
  }

  filterLogs(): void {
    let logs = this.allLogs;
    
    // Filter by selected span if any
    if (this.selectedSpan) {
      logs = logs.filter(entry => entry.span.id === this.selectedSpan!.id);
    }
    
    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      logs = logs.filter(entry =>
        entry.log.message.toLowerCase().includes(query) ||
        entry.span.service.toLowerCase().includes(query) ||
        entry.span.name.toLowerCase().includes(query) ||
        (entry.log.fields && JSON.stringify(entry.log.fields).toLowerCase().includes(query))
      );
    }
    
    // Apply level filter
    if (this.levelFilter !== 'all') {
      logs = logs.filter(entry => entry.log.level === this.levelFilter);
    }
    
    // Apply service filter
    if (this.serviceFilter !== 'all') {
      logs = logs.filter(entry => entry.span.service === this.serviceFilter);
    }
    
    this.filteredLogs = logs;
  }

  clearSelection(): void {
    this.requestService.selectSpan(null);
  }

  onSearchChange(): void {
    this.filterLogs();
  }

  onLevelFilterChange(): void {
    this.filterLogs();
  }

  onServiceFilterChange(): void {
    this.filterLogs();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.levelFilter = 'all';
    this.serviceFilter = 'all';
    this.filterLogs();
  }

  getUniqueServices(): string[] {
    const services = new Set<string>();
    this.allLogs.forEach(entry => services.add(entry.span.service));
    return Array.from(services).sort();
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

  getLogClass(level: string): string {
    return `log-${level}`;
  }

  getSpanColor(span: TraceSpan): string {
    switch (span.type) {
      case 'client':
        return '#61affe';
      case 'server':
        return '#49cc90';
      case 'database':
        return '#764ba2';
      case 'cache':
        return '#fca130';
      case 'queue':
        return '#50e3c2';
      default:
        return '#326ce5';
    }
  }
}
