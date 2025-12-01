import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { RequestService } from '../services/request.service';
import { ApiRequest, TraceSpan } from '../models/request.model';

interface FlameNode {
  span: TraceSpan;
  x: number;
  y: number;
  width: number;
  height: number;
  children: FlameNode[];
  depth: number;
}

@Component({
  selector: 'app-flamegraph',
  templateUrl: './flamegraph.component.html',
  styleUrls: ['./flamegraph.component.scss']
})
export class FlamegraphComponent implements OnInit, OnChanges {
  @Input() request: ApiRequest | null = null;
  @Output() spanClick = new EventEmitter<TraceSpan>();
  
  rootNodes: FlameNode[] = [];
  maxDepth = 0;
  maxDuration = 0;
  Math = Math;

  constructor(private requestService: RequestService) {}
  
  onSpanClick(span: TraceSpan): void {
    this.requestService.selectSpan(span);
    this.spanClick.emit(span);
  }

  ngOnInit(): void {
    if (this.request) {
      this.buildFlamegraph(this.request);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['request'] && this.request) {
      this.buildFlamegraph(this.request);
    }
  }

  buildFlamegraph(request: ApiRequest): void {
    const spans = request.trace.spans;
    this.maxDuration = Math.max(...spans.map(s => s.startTime + s.duration));
    
    // Find root spans
    const rootSpans = spans.filter(s => !s.parentId);
    
    // Build flamegraph tree
    this.rootNodes = rootSpans.map(span => this.buildNode(span, spans, 0, 0));
    this.maxDepth = this.getMaxDepth(this.rootNodes);
  }

  buildNode(span: TraceSpan, allSpans: TraceSpan[], x: number, depth: number): FlameNode {
    const children = allSpans.filter(s => s.parentId === span.id);
    
    const node: FlameNode = {
      span,
      x: (span.startTime / this.maxDuration) * 100,
      y: depth * 60,
      width: (span.duration / this.maxDuration) * 100,
      height: 50,
      children: [],
      depth
    };

    let childX = span.startTime;
    node.children = children.map(child => {
      const childNode = this.buildNode(child, allSpans, childX, depth + 1);
      childX += child.duration;
      return childNode;
    });

    return node;
  }

  getMaxDepth(nodes: FlameNode[]): number {
    if (nodes.length === 0) return 0;
    let maxDepth = 0;
    nodes.forEach(node => {
      maxDepth = Math.max(maxDepth, node.depth);
      const childrenDepth = this.getMaxDepth(node.children);
      maxDepth = Math.max(maxDepth, childrenDepth);
    });
    return maxDepth;
  }

  getAllNodes(nodes: FlameNode[]): FlameNode[] {
    const result: FlameNode[] = [];
    nodes.forEach(node => {
      result.push(node);
      result.push(...this.getAllNodes(node.children));
    });
    return result;
  }

  getSpanColor(span: TraceSpan): string {
    if (span.status === 'error') return '#f93e3e';
    if (span.status === 'warning') return '#fca130';
    if (span.status === 'processing') return '#61affe';
    
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
}

