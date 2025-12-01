# Kubernetes Architecture Diagram

An Angular 12 application that renders a hierarchical Kubernetes-centric architecture diagram for a mission-critical communications system.

## Features

- **Kubernetes Resource Visualization**: Displays Pods, Deployments, Services, StatefulSets, Ingress, and DaemonSets
- **Namespace Grouping**: Components organized into logical Kubernetes namespaces
- **Protocol Labels**: Clear labeling of communication protocols (gRPC, REST, Kafka/NATS, BLE, Wi-Fi, LTE, IPSec)
- **Modern Styling**: Cloud-native aesthetics with soft blues, purples, and greens
- **Interactive Elements**: Hover effects and smooth transitions

## Architecture Layers

1. **Ingress + Frontend Layer**: Command Console UI with Ingress controller
2. **Control Plane Layer**: Zone Controller API, Recording Ingestion, Auth Service
3. **Radio Control Layer**: Site Controller and Base Radio Service
4. **Edge Interface Layer**: Field Device Gateway with sidecars, BodyCam and LTE microservices
5. **Security Layer**: Firewall Gateway with IPSec tunnels
6. **Core Services Cluster**: Media Processor, Workflow Orchestrator, Database, API Gateway

## Getting Started

### Prerequisites

- Node.js (v14.x or v16.x recommended for Angular 12)
- npm or yarn

### Installation

```bash
npm install
```

### Development Server

```bash
npm start
```

Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Build

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

```
src/
├── app/
│   ├── app.component.ts          # Main app component
│   ├── app.module.ts              # Root module
│   └── kubernetes-diagram/
│       ├── kubernetes-diagram.component.ts    # Diagram component logic
│       ├── kubernetes-diagram.component.html  # SVG template
│       └── kubernetes-diagram.component.scss  # Component styles
├── environments/                  # Environment configurations
├── styles.scss                    # Global styles
└── index.html                     # Entry HTML
```

## Technologies Used

- Angular 12
- TypeScript
- SVG for diagram rendering
- SCSS for styling

## License

MIT

