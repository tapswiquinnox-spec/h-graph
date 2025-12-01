import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { RequestService } from '../services/request.service';
import { ApiRequest, TraceSpan } from '../models/request.model';

interface FlowNode {
  span: TraceSpan;
  x: number;
  y: number;
  width: number;
  height: number;
  children: FlowNode[];
}

@Component({
  selector: 'app-flowchart',
  templateUrl: './flowchart.component.html',
  styleUrls: ['./flowchart.component.scss']
})
export class FlowchartComponent implements OnInit, OnDestroy, OnChanges {
  @Input() request: ApiRequest | null = null;
  @Output() spanClick = new EventEmitter<TraceSpan>();
  
  nodes: FlowNode[] = [];
  connections: Array<{ from: FlowNode; to: FlowNode }> = [];
  svgWidth = 1200;
  svgHeight = 600;
  
  private resizeListener?: () => void;

  constructor(private requestService: RequestService) {}

  ngOnInit(): void {
    this.updateDimensions();
    if (this.request) {
      this.buildFlowchart(this.request);
    }
    
    // Listen for window resize
    if (typeof window !== 'undefined') {
      this.resizeListener = () => this.onResize();
      window.addEventListener('resize', this.resizeListener);
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined' && this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['request'] && this.request) {
      this.updateDimensions();
      this.buildFlowchart(this.request);
    }
  }

  onResize(): void {
    const oldWidth = this.svgWidth;
    this.updateDimensions();
    if (this.request && oldWidth !== this.svgWidth) {
      this.buildFlowchart(this.request);
    }
  }

  updateDimensions(): void {
    // Responsive sizing
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 768) {
        this.svgWidth = Math.max(600, width - 40);
        this.svgHeight = 500;
      } else if (width < 1024) {
        this.svgWidth = Math.max(800, width - 100);
        this.svgHeight = 550;
      } else if (width < 1440) {
        this.svgWidth = Math.min(1200, width - 200);
        this.svgHeight = 600;
      } else {
        this.svgWidth = 1200;
        this.svgHeight = 600;
      }
    }
  }

  buildFlowchart(request: ApiRequest): void {
    const spans = request.trace.spans;
    const rootSpans = spans.filter(s => !s.parentId);
    
    // Build tree structure
    this.nodes = [];
    this.connections = [];
    
    const nodeMap = new Map<string, FlowNode>();
    const levelMap = new Map<number, TraceSpan[]>();
    
    // Group spans by depth level
    spans.forEach(span => {
      const depth = this.getDepth(span, spans);
      if (!levelMap.has(depth)) {
        levelMap.set(depth, []);
      }
      levelMap.get(depth)!.push(span);
    });
    
    // Position nodes by level
    const maxDepth = Math.max(...Array.from(levelMap.keys()));
    const levelHeight = this.svgHeight / (maxDepth + 2);
    
    levelMap.forEach((levelSpans, depth) => {
      const levelY = (depth + 1) * levelHeight;
      const nodeWidth = 180;
      const spacing = (this.svgWidth - (levelSpans.length * nodeWidth)) / (levelSpans.length + 1);
      
      levelSpans.forEach((span, index) => {
        const x = spacing + index * (nodeWidth + spacing);
        const node: FlowNode = {
          span,
          x,
          y: levelY,
          width: nodeWidth,
          height: 80,
          children: []
        };
        nodeMap.set(span.id, node);
        this.nodes.push(node);
      });
    });
    
    // Build connections
    spans.forEach(span => {
      if (span.parentId) {
        const parentNode = nodeMap.get(span.parentId);
        const childNode = nodeMap.get(span.id);
        if (parentNode && childNode) {
          parentNode.children.push(childNode);
          this.connections.push({ from: parentNode, to: childNode });
        }
      }
    });
  }

  getDepth(span: TraceSpan, allSpans: TraceSpan[]): number {
    if (!span.parentId) return 0;
    const parent = allSpans.find(s => s.id === span.parentId);
    if (!parent) return 0;
    return 1 + this.getDepth(parent, allSpans);
  }

  getConnectionPath(from: FlowNode, to: FlowNode): string {
    const startX = from.x + from.width / 2;
    const startY = from.y + from.height;
    const endX = to.x + to.width / 2;
    const endY = to.y;
    
    const midY = (startY + endY) / 2;
    return `M ${startX} ${startY} Q ${startX} ${midY}, ${endX} ${endY}`;
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
  
  onSpanClick(span: TraceSpan): void {
    this.requestService.selectSpan(span);
    this.spanClick.emit(span);
  }
}
