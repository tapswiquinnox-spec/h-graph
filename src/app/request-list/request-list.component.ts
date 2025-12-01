import { Component, OnInit } from '@angular/core';
import { RequestService } from '../services/request.service';
import { ApiRequest } from '../models/request.model';

@Component({
  selector: 'app-request-list',
  templateUrl: './request-list.component.html',
  styleUrls: ['./request-list.component.scss']
})
export class RequestListComponent implements OnInit {
  requests: ApiRequest[] = [];
  filteredRequests: ApiRequest[] = [];
  selectedRequest: ApiRequest | null = null;
  
  searchQuery: string = '';
  statusFilter: string = 'all';
  methodFilter: string = 'all';

  constructor(private requestService: RequestService) {}

  ngOnInit(): void {
    this.requests = this.requestService.getRequests();
    this.filteredRequests = this.requests;
    this.requestService.getSelectedRequest().subscribe(request => {
      this.selectedRequest = request;
    });
  }

  selectRequest(request: ApiRequest): void {
    this.requestService.selectRequest(request);
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed':
        return '✓';
      case 'processing':
        return '⟳';
      case 'error':
        return '✗';
      default:
        return '○';
    }
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onMethodFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredRequests = this.requests.filter(request => {
      // Search filter
      const matchesSearch = !this.searchQuery || 
        request.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        request.path.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        request.method.toLowerCase().includes(this.searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = this.statusFilter === 'all' || request.status === this.statusFilter;

      // Method filter
      const matchesMethod = this.methodFilter === 'all' || request.method.toLowerCase() === this.methodFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.statusFilter = 'all';
    this.methodFilter = 'all';
    this.applyFilters();
  }
}
