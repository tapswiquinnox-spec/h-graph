import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiRequest, TraceSpan, LogEntry } from '../models/request.model';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private requests: ApiRequest[] = [];
  private selectedRequest$ = new BehaviorSubject<ApiRequest | null>(null);
  private selectedSpan$ = new BehaviorSubject<TraceSpan | null>(null);
  private drawerOpen$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.initializeSampleRequests();
  }

  getRequests(): ApiRequest[] {
    return this.requests;
  }

  getRequestById(id: string): ApiRequest | undefined {
    return this.requests.find(r => r.id === id);
  }

  selectRequest(request: ApiRequest | null): void {
    this.selectedRequest$.next(request);
    this.drawerOpen$.next(request !== null);
  }

  getSelectedRequest(): Observable<ApiRequest | null> {
    return this.selectedRequest$.asObservable();
  }

  selectSpan(span: TraceSpan | null): void {
    this.selectedSpan$.next(span);
  }

  getSelectedSpan(): Observable<TraceSpan | null> {
    return this.selectedSpan$.asObservable();
  }

  closeDrawer(): void {
    this.drawerOpen$.next(false);
    this.selectedRequest$.next(null);
  }

  isDrawerOpen(): Observable<boolean> {
    return this.drawerOpen$.asObservable();
  }

  private initializeSampleRequests(): void {
    const now = Date.now();
    
    this.requests = [
      {
        id: 'req-001',
        name: 'User Authentication',
        method: 'POST',
        path: '/api/auth/login',
        timestamp: new Date(now - 5000),
        status: 'completed',
        duration: 245,
        trace: {
          requestId: 'req-001',
          spans: [
            {
              id: 'span-1',
              name: 'POST /api/auth/login',
              service: 'api-gateway',
              type: 'server',
              startTime: 0,
              duration: 245,
              status: 'success',
              logs: [
                { timestamp: 0, level: 'info', message: 'Request received', fields: { method: 'POST', path: '/api/auth/login', ip: '192.168.1.100' } },
                { timestamp: 2, level: 'debug', message: 'Parsing request body', fields: { size: '256 bytes' } },
                { timestamp: 5, level: 'debug', message: 'Routing to auth-service', fields: { target: 'auth-service:8080' } },
                { timestamp: 7, level: 'trace', message: 'Request headers validated' }
              ],
              tags: { 'http.method': 'POST', 'http.path': '/api/auth/login' }
            },
            {
              id: 'span-2',
              name: 'authenticate',
              service: 'auth-service',
              type: 'server',
              parentId: 'span-1',
              startTime: 8,
              duration: 180,
              status: 'success',
              logs: [
                { timestamp: 0, level: 'info', message: 'Processing authentication request', fields: { userId: 'user123' } },
                { timestamp: 5, level: 'debug', message: 'Extracting credentials from request' },
                { timestamp: 10, level: 'debug', message: 'Validating credentials format', fields: { emailFormat: 'valid', passwordLength: 12 } },
                { timestamp: 15, level: 'trace', message: 'Checking rate limits', fields: { attempts: 1, limit: 5 } },
                { timestamp: 25, level: 'debug', message: 'Hashing password for comparison' },
                { timestamp: 35, level: 'info', message: 'Querying user database', fields: { query: 'SELECT * FROM users WHERE email = ?' } },
                { timestamp: 45, level: 'trace', message: 'Database connection established' }
              ],
              tags: { 'service': 'auth-service', 'operation': 'authenticate' }
            },
            {
              id: 'span-3',
              name: 'SELECT users',
              service: 'user-db',
              type: 'database',
              parentId: 'span-2',
              startTime: 50,
              duration: 25,
              status: 'success',
              logs: [
                { timestamp: 0, level: 'info', message: 'Executing query', fields: { query: 'SELECT * FROM users WHERE email = ?', params: ['user@example.com'] } },
                { timestamp: 5, level: 'debug', message: 'Query plan generated', fields: { plan: 'index_scan', cost: 0.25 } },
                { timestamp: 12, level: 'trace', message: 'Reading from index', fields: { index: 'idx_users_email' } },
                { timestamp: 18, level: 'debug', message: 'Fetching row data', fields: { rowId: 12345 } },
                { timestamp: 20, level: 'info', message: 'Query completed', fields: { rows: 1, duration: '20ms' } },
                { timestamp: 22, level: 'trace', message: 'Connection returned to pool' }
              ],
              tags: { 'db.type': 'postgresql', 'db.statement': 'SELECT' }
            },
            {
              id: 'span-4',
              name: 'generate-token',
              service: 'auth-service',
              type: 'server',
              parentId: 'span-2',
              startTime: 80,
              duration: 95,
              status: 'success',
              logs: [
                { timestamp: 0, level: 'info', message: 'Generating JWT token', fields: { algorithm: 'HS256' } },
                { timestamp: 15, level: 'debug', message: 'Creating token payload', fields: { userId: 'user123', roles: ['user'] } },
                { timestamp: 35, level: 'debug', message: 'Signing token with secret key' },
                { timestamp: 60, level: 'trace', message: 'Token signature computed' },
                { timestamp: 75, level: 'debug', message: 'Setting token expiration', fields: { expiresIn: '3600s' } },
                { timestamp: 85, level: 'info', message: 'Token generated successfully', fields: { tokenLength: 256 } }
              ],
              tags: { 'operation': 'generate-token' }
            }
          ]
        }
      },
      {
        id: 'req-002',
        name: 'Get User Profile',
        method: 'GET',
        path: '/api/users/profile',
        timestamp: new Date(now - 3000),
        status: 'processing',
        duration: 120,
        trace: {
          requestId: 'req-002',
          spans: [
            {
              id: 'span-5',
              name: 'GET /api/users/profile',
              service: 'api-gateway',
              type: 'server',
              startTime: 0,
              duration: 120,
              status: 'success',
              logs: [
                { timestamp: 0, level: 'info', message: 'Request received', fields: { method: 'GET', path: '/api/users/profile' } },
                { timestamp: 3, level: 'debug', message: 'Extracting authentication token', fields: { header: 'Authorization' } },
                { timestamp: 8, level: 'trace', message: 'Token validated', fields: { userId: 'user123' } }
              ],
              tags: { 'http.method': 'GET' }
            },
            {
              id: 'span-6',
              name: 'getProfile',
              service: 'user-service',
              type: 'server',
              parentId: 'span-5',
              startTime: 10,
              duration: 95,
              status: 'processing',
              logs: [
                { timestamp: 0, level: 'info', message: 'Fetching user profile', fields: { userId: 'user123' } },
                { timestamp: 5, level: 'debug', message: 'Checking cache', fields: { cacheKey: 'user:profile:user123' } },
                { timestamp: 12, level: 'trace', message: 'Cache miss, querying database' },
                { timestamp: 20, level: 'debug', message: 'Building database query', fields: { includeFields: ['name', 'email', 'avatar'] } },
                { timestamp: 25, level: 'trace', message: 'Preparing database connection' }
              ],
              tags: { 'service': 'user-service' }
            },
            {
              id: 'span-7',
              name: 'SELECT profile',
              service: 'user-db',
              type: 'database',
              parentId: 'span-6',
              startTime: 30,
              duration: 45,
              status: 'processing',
              logs: [
                { timestamp: 0, level: 'info', message: 'Executing query', fields: { query: 'SELECT * FROM profiles WHERE user_id = ?', params: ['user123'] } },
                { timestamp: 8, level: 'debug', message: 'Query plan: index lookup', fields: { index: 'idx_profiles_user_id' } },
                { timestamp: 15, level: 'trace', message: 'Reading index pages', fields: { pages: 2 } },
                { timestamp: 28, level: 'debug', message: 'Fetching profile data', fields: { rowId: 67890 } },
                { timestamp: 35, level: 'trace', message: 'Serializing result set' }
              ],
              tags: { 'db.type': 'postgresql' }
            }
          ]
        }
      },
      {
        id: 'req-003',
        name: 'Process Payment',
        method: 'POST',
        path: '/api/payments/process',
        timestamp: new Date(now - 1000),
        status: 'error',
        duration: 350,
        trace: {
          requestId: 'req-003',
          spans: [
            {
              id: 'span-8',
              name: 'POST /api/payments/process',
              service: 'api-gateway',
              type: 'server',
              startTime: 0,
              duration: 350,
              status: 'error',
              logs: [
                { timestamp: 0, level: 'info', message: 'Request received', fields: { method: 'POST', path: '/api/payments/process' } },
                { timestamp: 5, level: 'debug', message: 'Validating payment request', fields: { amount: 99.99, currency: 'USD' } },
                { timestamp: 12, level: 'trace', message: 'Checking payment gateway availability' },
                { timestamp: 280, level: 'warn', message: 'Payment gateway slow response', fields: { elapsed: '280ms', threshold: '200ms' } },
                { timestamp: 320, level: 'error', message: 'Request failed', fields: { error: 'Timeout', timeout: '300ms' } }
              ],
              tags: { 'http.method': 'POST', 'error': 'true' }
            },
            {
              id: 'span-9',
              name: 'processPayment',
              service: 'payment-service',
              type: 'server',
              parentId: 'span-8',
              startTime: 12,
              duration: 300,
              status: 'error',
              logs: [
                { timestamp: 0, level: 'info', message: 'Processing payment', fields: { amount: 99.99, orderId: 'order-456' } },
                { timestamp: 10, level: 'debug', message: 'Validating payment details', fields: { cardType: 'visa', last4: '1234' } },
                { timestamp: 25, level: 'trace', message: 'Creating payment gateway request', fields: { gateway: 'stripe' } },
                { timestamp: 45, level: 'debug', message: 'Sending request to payment gateway', fields: { endpoint: 'https://api.stripe.com/v1/charges' } },
                { timestamp: 80, level: 'trace', message: 'Waiting for gateway response' },
                { timestamp: 120, level: 'debug', message: 'Gateway connection established' },
                { timestamp: 150, level: 'warn', message: 'Payment gateway slow response', fields: { elapsed: '150ms', expected: '50ms' } },
                { timestamp: 200, level: 'warn', message: 'Still waiting for response', fields: { elapsed: '200ms' } },
                { timestamp: 250, level: 'warn', message: 'Response delay critical', fields: { elapsed: '250ms' } },
                { timestamp: 295, level: 'error', message: 'Payment gateway timeout', fields: { timeout: 300, error: 'ECONNTIMEOUT' } }
              ],
              tags: { 'service': 'payment-service', 'error': 'true' }
            }
          ]
        }
      },
      {
        id: 'req-004',
        name: 'Place Order with Payment',
        method: 'POST',
        path: '/api/orders/create',
        timestamp: new Date(now - 2000),
        status: 'completed',
        duration: 1250,
        trace: {
          requestId: 'req-004',
          spans: [
            {
              id: 'span-10',
              name: 'POST /api/orders/create',
              service: 'api-gateway',
              type: 'server',
              startTime: 0,
              duration: 1250,
              status: 'success',
              logs: [
                { timestamp: 0, level: 'info', message: 'Request received', fields: { method: 'POST', path: '/api/orders/create', ip: '192.168.1.105' } },
                { timestamp: 3, level: 'debug', message: 'Validating authentication token' },
                { timestamp: 8, level: 'info', message: 'Token validated, routing to order-service' },
                { timestamp: 10, level: 'trace', message: 'Request forwarded to order-service' }
              ],
              tags: { 'http.method': 'POST', 'http.path': '/api/orders/create' }
            },
            {
              id: 'span-11',
              name: 'authenticate',
              service: 'auth-service',
              type: 'server',
              parentId: 'span-10',
              startTime: 3,
              duration: 5,
              status: 'success',
              logs: [
                { timestamp: 0, level: 'info', message: 'Validating JWT token', fields: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' } },
                { timestamp: 2, level: 'debug', message: 'Token signature verified' },
                { timestamp: 4, level: 'info', message: 'Token valid', fields: { userId: 'user456', expiresIn: 3600 } }
              ],
              tags: { 'service': 'auth-service', 'operation': 'authenticate' }
            },
            {
              id: 'span-12',
              name: 'createOrder',
              service: 'order-service',
              type: 'server',
              parentId: 'span-10',
              startTime: 12,
              duration: 1200,
              status: 'success',
              logs: [
                { timestamp: 0, level: 'info', message: 'Creating new order', fields: { userId: 'user456', items: 3 } },
                { timestamp: 15, level: 'debug', message: 'Validating order items' },
                { timestamp: 30, level: 'info', message: 'Fetching product details from catalog-service' },
                { timestamp: 450, level: 'info', message: 'Calculating order total' },
                { timestamp: 500, level: 'info', message: 'Checking inventory availability' },
                { timestamp: 800, level: 'info', message: 'Processing payment' },
                { timestamp: 1100, level: 'info', message: 'Order created successfully', fields: { orderId: 'order-789' } }
              ],
              tags: { 'service': 'order-service', 'operation': 'createOrder' }
            },
            {
              id: 'span-13',
              name: 'getProducts',
              service: 'catalog-service',
              type: 'server',
              parentId: 'span-12',
              startTime: 35,
              duration: 380,
              status: 'success',
              logs: [
                { timestamp: 0, level: 'info', message: 'Fetching product details', fields: { productIds: [101, 102, 103] } },
                { timestamp: 10, level: 'debug', message: 'Checking cache first' },
                { timestamp: 15, level: 'trace', message: 'Cache miss for products 101, 102' },
                { timestamp: 20, level: 'info', message: 'Querying product database' },
                { timestamp: 250, level: 'info', message: 'Products retrieved', fields: { count: 3 } },
                { timestamp: 260, level: 'debug', message: 'Updating cache with product data' },
                { timestamp: 350, level: 'info', message: 'Returning product details' }
              ],
              tags: { 'service': 'catalog-service', 'operation': 'getProducts' }
            },
            {
              id: 'span-14',
              name: 'getFromCache',
              service: 'redis-cache',
              type: 'cache',
              parentId: 'span-13',
              startTime: 10,
              duration: 5,
              status: 'success',
              logs: [
                { timestamp: 0, level: 'debug', message: 'Checking Redis cache', fields: { keys: ['product:101', 'product:102', 'product:103'] } },
                { timestamp: 3, level: 'info', message: 'Cache hit for product:103', fields: { cached: true } },
                { timestamp: 4, level: 'trace', message: 'Cache miss for products 101, 102' }
              ],
              tags: { 'cache.type': 'redis', 'operation': 'get' }
            },
            {
              id: 'span-15',
              name: 'SELECT products',
              service: 'product-db',
              type: 'database',
              parentId: 'span-13',
              startTime: 25,
              duration: 220,
              status: 'success',
              logs: [
                { timestamp: 0, level: 'info', message: 'Executing query', fields: { query: 'SELECT * FROM products WHERE id IN (?, ?)', params: [101, 102] } },
                { timestamp: 15, level: 'debug', message: 'Query plan: index scan', fields: { index: 'idx_products_id' } },
                { timestamp: 80, level: 'trace', message: 'Reading from index', fields: { pages: 3 } },
                { timestamp: 150, level: 'debug', message: 'Fetching product rows', fields: { rows: 2 } },
                { timestamp: 200, level: 'info', message: 'Query completed', fields: { duration: '220ms', rows: 2 } },
                { timestamp: 210, level: 'trace', message: 'Connection returned to pool' }
              ],
              tags: { 'db.type': 'postgresql', 'db.statement': 'SELECT' }
            },
            {
              id: 'span-16',
              name: 'setCache',
              service: 'redis-cache',
              type: 'cache',
              parentId: 'span-13',
              startTime: 260,
              duration: 85,
              status: 'success',
              logs: [
                { timestamp: 0, level: 'info', message: 'Caching product data', fields: { keys: ['product:101', 'product:102'], ttl: 3600 } },
                { timestamp: 25, level: 'debug', message: 'Serializing product objects' },
                { timestamp: 60, level: 'trace', message: 'Writing to Redis', fields: { bytes: 2048 } },
                { timestamp: 80, level: 'info', message: 'Cache updated successfully' }
              ],
              tags: { 'cache.type': 'redis', 'operation': 'set' }
            },
            {
              id: 'span-17',
              name: 'checkInventory',
              service: 'inventory-service',
              type: 'server',
              parentId: 'span-12',
              startTime: 510,
              duration: 250,
              status: 'success',
              logs: [
                { timestamp: 0, level: 'info', message: 'Checking inventory availability', fields: { items: [{ productId: 101, quantity: 2 }, { productId: 102, quantity: 1 }] } },
                { timestamp: 20, level: 'debug', message: 'Querying inventory database' },
                { timestamp: 180, level: 'info', message: 'Inventory check completed', fields: { available: true, reserved: true } },
                { timestamp: 200, level: 'info', message: 'Reserving inventory items' },
                { timestamp: 240, level: 'info', message: 'Inventory reserved successfully' }
              ],
              tags: { 'service': 'inventory-service', 'operation': 'checkInventory' }
            },
            {
              id: 'span-18',
              name: 'SELECT inventory',
              service: 'inventory-db',
              type: 'database',
              parentId: 'span-17',
              startTime: 25,
              duration: 150,
              status: 'success',
              logs: [
                { timestamp: 0, level: 'info', message: 'Executing query', fields: { query: 'SELECT * FROM inventory WHERE product_id IN (?, ?) FOR UPDATE' } },
                { timestamp: 50, level: 'debug', message: 'Acquiring row locks' },
                { timestamp: 100, level: 'trace', message: 'Rows locked successfully' },
                { timestamp: 140, level: 'info', message: 'Query completed', fields: { rows: 2 } }
              ],
              tags: { 'db.type': 'postgresql', 'db.statement': 'SELECT' }
            },
            {
              id: 'span-19',
              name: 'UPDATE inventory',
              service: 'inventory-db',
              type: 'database',
              parentId: 'span-17',
              startTime: 180,
              duration: 55,
              status: 'success',
              logs: [
                { timestamp: 0, level: 'info', message: 'Updating inventory', fields: { query: 'UPDATE inventory SET reserved = reserved + ? WHERE product_id = ?' } },
                { timestamp: 30, level: 'debug', message: 'Executing update statements' },
                { timestamp: 50, level: 'info', message: 'Inventory updated', fields: { affectedRows: 2 } }
              ],
              tags: { 'db.type': 'postgresql', 'db.statement': 'UPDATE' }
            },
            {
              id: 'span-20',
              name: 'processPayment',
              service: 'payment-service',
              type: 'server',
              parentId: 'span-12',
              startTime: 810,
              duration: 320,
              status: 'success',
              logs: [
                { timestamp: 0, level: 'info', message: 'Processing payment', fields: { amount: 299.97, currency: 'USD', orderId: 'order-789' } },
                { timestamp: 15, level: 'debug', message: 'Validating payment method', fields: { method: 'credit_card', last4: '4242' } },
                { timestamp: 40, level: 'info', message: 'Calling payment gateway' },
                { timestamp: 280, level: 'info', message: 'Payment processed successfully', fields: { transactionId: 'txn-abc123', status: 'succeeded' } },
                { timestamp: 300, level: 'debug', message: 'Recording payment in database' }
              ],
              tags: { 'service': 'payment-service', 'operation': 'processPayment' }
            },
            {
              id: 'span-21',
              name: 'charge',
              service: 'stripe-gateway',
              type: 'server',
              parentId: 'span-20',
              startTime: 45,
              duration: 230,
              status: 'success',
              logs: [
                { timestamp: 0, level: 'info', message: 'Sending charge request to Stripe', fields: { endpoint: 'https://api.stripe.com/v1/charges' } },
                { timestamp: 20, level: 'debug', message: 'Request signed and encrypted' },
                { timestamp: 50, level: 'trace', message: 'Waiting for gateway response' },
                { timestamp: 180, level: 'info', message: 'Charge successful', fields: { chargeId: 'ch_abc123', status: 'succeeded' } },
                { timestamp: 220, level: 'debug', message: 'Processing response' }
              ],
              tags: { 'gateway': 'stripe', 'operation': 'charge' }
            },
            {
              id: 'span-22',
              name: 'INSERT payment',
              service: 'payment-db',
              type: 'database',
              parentId: 'span-20',
              startTime: 285,
              duration: 30,
              status: 'success',
              logs: [
                { timestamp: 0, level: 'info', message: 'Recording payment transaction', fields: { query: 'INSERT INTO payments (order_id, amount, transaction_id) VALUES (?, ?, ?)' } },
                { timestamp: 15, level: 'debug', message: 'Executing insert' },
                { timestamp: 25, level: 'info', message: 'Payment recorded', fields: { paymentId: 45678 } }
              ],
              tags: { 'db.type': 'postgresql', 'db.statement': 'INSERT' }
            },
            {
              id: 'span-23',
              name: 'INSERT order',
              service: 'order-db',
              type: 'database',
              parentId: 'span-12',
              startTime: 1150,
              duration: 45,
              status: 'success',
              logs: [
                { timestamp: 0, level: 'info', message: 'Creating order record', fields: { query: 'INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)' } },
                { timestamp: 20, level: 'debug', message: 'Executing insert statement' },
                { timestamp: 35, level: 'info', message: 'Order created', fields: { orderId: 789 } }
              ],
              tags: { 'db.type': 'postgresql', 'db.statement': 'INSERT' }
            },
            {
              id: 'span-24',
              name: 'publishOrderCreated',
              service: 'event-bus',
              type: 'queue',
              parentId: 'span-12',
              startTime: 1200,
              duration: 45,
              status: 'success',
              logs: [
                { timestamp: 0, level: 'info', message: 'Publishing order.created event', fields: { topic: 'orders', event: 'order.created' } },
                { timestamp: 15, level: 'debug', message: 'Serializing event payload' },
                { timestamp: 30, level: 'info', message: 'Event published to Kafka', fields: { partition: 2, offset: 12345 } }
              ],
              tags: { 'queue.type': 'kafka', 'topic': 'orders' }
            },
            {
              id: 'span-25',
              name: 'sendNotification',
              service: 'notification-service',
              type: 'server',
              parentId: 'span-24',
              startTime: 5,
              duration: 35,
              status: 'success',
              logs: [
                { timestamp: 0, level: 'info', message: 'Processing order.created event', fields: { orderId: 'order-789' } },
                { timestamp: 10, level: 'debug', message: 'Preparing notification', fields: { type: 'email', recipient: 'user456@example.com' } },
                { timestamp: 25, level: 'info', message: 'Notification queued', fields: { notificationId: 'notif-999' } }
              ],
              tags: { 'service': 'notification-service', 'operation': 'sendNotification' }
            },
            {
              id: 'span-26',
              name: 'updateAnalytics',
              service: 'analytics-service',
              type: 'server',
              parentId: 'span-24',
              startTime: 8,
              duration: 30,
              status: 'success',
              logs: [
                { timestamp: 0, level: 'info', message: 'Recording order event', fields: { event: 'order.created', orderId: 'order-789' } },
                { timestamp: 15, level: 'debug', message: 'Updating analytics metrics' },
                { timestamp: 25, level: 'info', message: 'Analytics updated', fields: { metrics: ['orders_count', 'revenue'] } }
              ],
              tags: { 'service': 'analytics-service', 'operation': 'updateAnalytics' }
            }
          ]
        }
      }
    ];
  }
}
