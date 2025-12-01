import { Component, OnInit, OnDestroy, OnChanges, Input, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { RequestService } from '../services/request.service';
import { ApiRequest, TraceSpan } from '../models/request.model';

interface SpanNode {
  span: TraceSpan;
  x: number;
  y: number;
  width: number;
  height: number;
  children: SpanNode[];
}

@Component({
  selector: 'app-trace-viewer',
  templateUrl: './trace-viewer.component.html',
  styleUrls: ['./trace-viewer.component.scss']
})
export class TraceViewerComponent implements OnInit, OnDestroy, OnChanges {
  @Input() request: ApiRequest | null = null;
  
  rootSpans: TraceSpan[] = [];
  spanNodes: SpanNode[] = [];
  maxDuration = 0;
  selectedSpan: TraceSpan | null = null;
  activeTab: 'timeline' | 'flamegraph' | 'flowchart' | 'logs' = 'timeline';
  Math = Math; // Expose Math to template
  
  // Filter and search
  searchQuery: string = '';
  statusFilter: string = 'all';
  serviceFilter: string = 'all';
  filteredSpans: TraceSpan[] = [];
  
  private subscriptions: Subscription[] = [];

  constructor(private requestService: RequestService) {}

  ngOnInit(): void {
    if (this.request) {
      this.buildTraceTree(this.request);
    }
    
    const sub = this.requestService.getSelectedSpan().subscribe(span => {
      this.selectedSpan = span;
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['request'] && this.request) {
      this.buildTraceTree(this.request);
    }
  }

  buildTraceTree(request: ApiRequest): void {
    const spans = request.trace.spans;
    this.maxDuration = Math.max(...spans.map(s => s.startTime + s.duration));
    
    // Find root spans (no parent)
    this.rootSpans = spans.filter(s => !s.parentId);
    
    // Build tree structure
    this.spanNodes = this.rootSpans.map(span => this.buildSpanNode(span, spans, 0, 0));
    this.applyFilters();
  }

  buildSpanNode(span: TraceSpan, allSpans: TraceSpan[], x: number, y: number): SpanNode {
    const children = allSpans.filter(s => s.parentId === span.id);
    const node: SpanNode = {
      span,
      x: (span.startTime / this.maxDuration) * 800,
      y: y * 80 + 20,
      width: (span.duration / this.maxDuration) * 800,
      height: 50,
      children: []
    };

    let childY = y + 1;
    node.children = children.map(child => {
      const childNode = this.buildSpanNode(child, allSpans, x, childY);
      childY += this.countDescendants(child, allSpans) + 1;
      return childNode;
    });

    return node;
  }

  countDescendants(span: TraceSpan, allSpans: TraceSpan[]): number {
    const children = allSpans.filter(s => s.parentId === span.id);
    return children.length + children.reduce((sum, child) => sum + this.countDescendants(child, allSpans), 0);
  }

  getAllSpanNodes(nodes: SpanNode[]): SpanNode[] {
    const result: SpanNode[] = [];
    nodes.forEach(node => {
      result.push(node);
      result.push(...this.getAllSpanNodes(node.children));
    });
    return result;
  }

  onSpanClick(span: TraceSpan): void {
    this.requestService.selectSpan(span);
    this.setActiveTab('logs');
  }

  getSpanColor(span: TraceSpan): string {
    if (span.status === 'error') return '#f93e3e';
    if (span.status === 'warning') return '#fca130';
    
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

  getServiceIcon(type: string): string {
    switch (type) {
      case 'client':
        return '🌐';
      case 'server':
        return '⚙️';
      case 'database':
        return '💾';
      case 'cache':
        return '⚡';
      case 'queue':
        return '📬';
      default:
        return '☸️';
    }
  }
  
  closeDrawer(): void {
    this.requestService.closeDrawer();
  }
  
  getTimeTicks(): number[] {
    const ticks: number[] = [];
    for (let i = 0; i <= 10; i++) {
      ticks.push(i * 10);
    }
    return ticks;
  }
  
  formatTime(ms: number): number {
    return Math.round(ms);
  }

  setActiveTab(tab: 'timeline' | 'flamegraph' | 'flowchart' | 'logs'): void {
    this.activeTab = tab;
  }

  applyFilters(): void {
    if (!this.request) return;
    
    let spans = this.request.trace.spans;
    
    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      spans = spans.filter(span =>
        span.name.toLowerCase().includes(query) ||
        span.service.toLowerCase().includes(query) ||
        span.type.toLowerCase().includes(query)
      );
    }
    
    // Status filter
    if (this.statusFilter !== 'all') {
      spans = spans.filter(span => span.status === this.statusFilter);
    }
    
    // Service filter
    if (this.serviceFilter !== 'all') {
      spans = spans.filter(span => span.service === this.serviceFilter);
    }
    
    this.filteredSpans = spans;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onServiceFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.statusFilter = 'all';
    this.serviceFilter = 'all';
    this.applyFilters();
  }

  getUniqueServices(): string[] {
    if (!this.request) return [];
    const services = new Set<string>();
    this.request.trace.spans.forEach(span => services.add(span.service));
    return Array.from(services).sort();
  }
}
