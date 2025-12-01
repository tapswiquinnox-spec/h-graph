import { Component, OnInit } from '@angular/core';
import { RequestService } from './services/request.service';
import { ApiRequest } from './models/request.model';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>Request Trace Analyzer</h1>
        <p class="subtitle">Monitor API requests through microservices</p>
      </header>
      <main class="app-main">
        <div class="request-list-panel">
          <app-request-list></app-request-list>
        </div>
        <div class="drawer-overlay" *ngIf="drawerOpen" (click)="closeDrawer()">
          <div class="drawer-content" (click)="$event.stopPropagation()">
            <app-trace-viewer [request]="selectedRequest"></app-trace-viewer>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: #f5f5f5;
      display: flex;
      flex-direction: column;
    }
    .app-header {
      text-align: center;
      color: #333;
      padding: 20px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .app-header h1 {
      margin: 0;
      font-size: 1.5em;
      font-weight: 300;
      
      @media (min-width: 768px) {
        font-size: 2em;
      }
    }
    .subtitle {
      margin: 10px 0 0 0;
      font-size: 0.9em;
      color: #666;
      
      @media (min-width: 768px) {
        font-size: 1em;
      }
    }
    .app-main {
      flex: 1;
      display: flex;
      position: relative;
      overflow: hidden;
    }
    .request-list-panel {
      width: 100%;
      background: white;
      overflow: hidden;
    }
    .drawer-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 100;
      animation: fadeIn 0.2s ease;
    }
    .drawer-content {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 100%;
      max-width: 100%;
      background: white;
      box-shadow: -2px 0 10px rgba(0, 0, 0, 0.2);
      animation: slideIn 0.3s ease;
      overflow: hidden;
      
      @media (min-width: 768px) {
        width: 90%;
        max-width: 90%;
      }
      
      @media (min-width: 1024px) {
        width: 80%;
        max-width: 1200px;
      }
      
      @media (min-width: 1440px) {
        width: 75%;
        max-width: 1400px;
      }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
  `]
})
export class AppComponent implements OnInit {
  selectedRequest: ApiRequest | null = null;
  drawerOpen = false;

  constructor(private requestService: RequestService) {}

  ngOnInit(): void {
    this.requestService.getSelectedRequest().subscribe(request => {
      this.selectedRequest = request;
    });
    
    this.requestService.isDrawerOpen().subscribe(open => {
      this.drawerOpen = open;
    });
  }

  closeDrawer(): void {
    this.requestService.closeDrawer();
  }
}
