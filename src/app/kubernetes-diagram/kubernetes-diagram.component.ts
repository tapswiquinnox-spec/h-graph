import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RequestService } from '../services/request.service';
import { ApiRequest, FlowNode, FlowEdge } from '../models/request.model';

interface K8sResource {
  id: string;
  type: 'Ingress' | 'Deployment' | 'Service' | 'StatefulSet' | 'Pod' | 'DaemonSet';
  name: string;
  namespace: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  flowNode: FlowNode;
  status: 'success' | 'error' | 'processing';
}

interface Namespace {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  resources: K8sResource[];
}

@Component({
  selector: 'app-kubernetes-diagram',
  templateUrl: './kubernetes-diagram.component.html',
  styleUrls: ['./kubernetes-diagram.component.scss']
})
export class KubernetesDiagramComponent implements OnInit, OnChanges {
  @Input() request: ApiRequest | null = null;

  svgWidth = 1100;
  svgHeight = 700;
  namespaces: Namespace[] = [];
  allResources: K8sResource[] = [];
  connections: FlowEdge[] = [];

  constructor(private requestService: RequestService) {}

  ngOnInit(): void {
    if (this.request) {
      this.buildDiagramFromRequest(this.request);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['request'] && this.request) {
      this.buildDiagramFromRequest(this.request);
    }
  }

  buildDiagramFromRequest(request: ApiRequest): void {
    this.allResources = [];
    this.connections = request.flow.edges;
    this.namespaces = [];

    // Group nodes by namespace
    const namespaceMap = new Map<string, FlowNode[]>();
    request.flow.nodes.forEach(node => {
      if (!namespaceMap.has(node.namespace)) {
        namespaceMap.set(node.namespace, []);
      }
      namespaceMap.get(node.namespace)!.push(node);
    });

    // Create namespaces and position resources
    let yOffset = 50;
    const namespaceWidth = this.svgWidth - 100;
    const horizontalSpacing = 200;
    const verticalSpacing = 120;

    namespaceMap.forEach((nodes, namespaceName) => {
      const namespace: Namespace = {
        id: namespaceName,
        name: namespaceName,
        x: 50,
        y: yOffset,
        width: namespaceWidth,
        height: Math.max(150, nodes.length * verticalSpacing + 50),
        resources: []
      };

      nodes.forEach((node, index) => {
        const x = 100 + (index % 3) * horizontalSpacing;
        const y = yOffset + 50 + Math.floor(index / 3) * verticalSpacing;

        const resource: K8sResource = {
          id: node.id,
          type: node.type,
          name: node.name,
          namespace: node.namespace,
          x,
          y,
          width: 180,
          height: 60,
          color: this.getResourceColor(node.type, node.status),
          flowNode: node,
          status: node.status
        };

        namespace.resources.push(resource);
        this.allResources.push(resource);
      });

      yOffset += namespace.height + 30;
      this.namespaces.push(namespace);
    });

    this.svgHeight = yOffset + 50;
  }

  getResourceColor(type: string, status: string): string {
    if (status === 'error') return '#f93e3e';
    if (status === 'processing') return '#fca130';
    
    switch (type) {
      case 'Ingress':
        return '#326ce5';
      case 'Deployment':
        return '#326ce5';
      case 'Service':
        return '#00d4aa';
      case 'StatefulSet':
        return '#326ce5';
      case 'Pod':
        return '#326ce5';
      case 'DaemonSet':
        return '#326ce5';
      default:
        return '#326ce5';
    }
  }

  getResourceIcon(type: string): string {
    switch (type) {
      case 'Ingress':
        return '🌐';
      case 'Deployment':
        return '📦';
      case 'Service':
        return '🔗';
      case 'StatefulSet':
        return '💾';
      case 'Pod':
        return '☸️';
      case 'DaemonSet':
        return '🛡️';
      default:
        return '☸️';
    }
  }

  findResource(id: string): K8sResource | undefined {
    return this.allResources.find(r => r.id === id);
  }

  getConnectionPath(source: K8sResource, target: K8sResource): string {
    const startX = source.x + source.width / 2;
    const startY = source.y + source.height;
    const endX = target.x + target.width / 2;
    const endY = target.y;

    const dx = endX - startX;
    const dy = endY - startY;
    const controlOffset = Math.abs(dy) * 0.5;
    
    const cp1x = startX;
    const cp1y = startY + controlOffset;
    const cp2x = endX;
    const cp2y = endY - controlOffset;
    
    return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
  }

  onNodeClick(resource: K8sResource): void {
    this.requestService.selectNode(resource.flowNode);
  }
}
