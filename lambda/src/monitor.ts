import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';
import { 
  MonitorJob, 
  MonitorJobResult, 
  MONITOR_STATUS, 
  MONITOR_REGION,
  WebhookMonitorResult 
} from './types';

export class MonitorWorker {
  private readonly apiEndpoint: string;
  private readonly apiSecret: string;
  private readonly region: string;

  constructor() {
    this.apiEndpoint = process.env.API_ENDPOINT || '';
    this.apiSecret = process.env.API_SECRET || '';
    this.region = process.env.AWS_REGION || 'us-east-1';

    if (!this.apiEndpoint || !this.apiSecret) {
      throw new Error('API_ENDPOINT and API_SECRET environment variables are required');
    }
  }

  /**
   * Execute HTTP monitoring check following uptimeMonitor's monitor pattern
   */
  async executeMonitorCheck(job: MonitorJob): Promise<MonitorJobResult> {
    const startTime = Date.now();
    let result: MonitorJobResult;

    try {
      // Validate URL
      const url = new URL(job.url);
      
      // Perform HTTP request with retries
      const response = await this.performHttpRequest(job, url);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Check if status code is expected
      const isStatusCodeExpected = job.expectedStatusCodes.includes(response.statusCode);
      const status = isStatusCodeExpected ? MONITOR_STATUS.UP : MONITOR_STATUS.DOWN;

      result = {
        monitorId: job.monitorId,
        region: job.region,
        status,
        responseTime,
        statusCode: response.statusCode,
        errorMessage: isStatusCodeExpected ? null : `Unexpected status code: ${response.statusCode}`,
        checkedAt: new Date().toISOString(),
      };

      console.log('HTTP request successful:', {
        monitorId: job.monitorId,
        url: job.url,
        statusCode: response.statusCode,
        responseTime,
        status,
      });

    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      result = {
        monitorId: job.monitorId,
        region: job.region,
        status: MONITOR_STATUS.DOWN,
        responseTime: responseTime > 0 ? responseTime : null,
        statusCode: null,
        errorMessage: this.sanitizeErrorMessage(error.message),
        checkedAt: new Date().toISOString(),
      };

      console.error('HTTP request failed:', {
        monitorId: job.monitorId,
        url: job.url,
        error: error.message,
        responseTime,
      });
    }

    return result;
  }

  /**
   * Perform HTTP request with timeout and retry logic following uptimeMonitor pattern
   */
  private async performHttpRequest(job: MonitorJob, url: URL): Promise<{ statusCode: number }> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: job.method,
        timeout: job.timeout * 1000, // Convert to milliseconds
        headers: {
          'User-Agent': 'StayUp Monitor/1.0',
          ...job.headers,
        },
      };

      // Add request body if provided
      let requestBody = '';
      if (job.body && ['POST', 'PUT', 'PATCH'].includes(job.method)) {
        requestBody = job.body;
        options.headers['Content-Length'] = Buffer.byteLength(requestBody);
        
        if (!options.headers['Content-Type']) {
          options.headers['Content-Type'] = 'application/json';
        }
      }

      const client = url.protocol === 'https:' ? https : http;
      
      const req = client.request(options, (res) => {
        // We only care about the status code for uptime monitoring
        resolve({ statusCode: res.statusCode || 0 });
      });

      req.on('error', (error) => {
        reject(new Error(`Request error: ${error.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${job.timeout} seconds`));
      });

      // Send request body if provided
      if (requestBody) {
        req.write(requestBody);
      }

      req.end();
    });
  }

  /**
   * Implement retry logic with exponential backoff following uptimeMonitor pattern
   */
  private async executeWithRetry(job: MonitorJob, url: URL, maxRetries: number = 3): Promise<{ statusCode: number }> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.performHttpRequest(job, url);
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`Retry attempt ${attempt + 1} for monitor ${job.monitorId} after ${delay}ms`);
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  /**
   * Send monitoring results back to main API following uptimeMonitor pattern
   */
  async sendResults(results: MonitorJobResult[], requestId: string): Promise<void> {
    const webhookPayload: WebhookMonitorResult = {
      results,
      lambdaRequestId: requestId,
      region: this.region as any,
    };

    const postData = JSON.stringify(webhookPayload);

    const options = {
      hostname: new URL(this.apiEndpoint).hostname,
      port: new URL(this.apiEndpoint).port || 443,
      path: '/api/webhooks/monitor-results',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'x-api-secret': this.apiSecret,
        'User-Agent': 'StayUp Lambda Monitor/1.0',
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('Results sent successfully to API:', {
              statusCode: res.statusCode,
              resultCount: results.length,
            });
            resolve();
          } else {
            console.error('API returned error status:', {
              statusCode: res.statusCode,
              response: data,
            });
            reject(new Error(`API returned status ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        console.error('Error sending results to API:', error);
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Timeout sending results to API'));
      });

      req.setTimeout(10000); // 10 second timeout
      req.write(postData);
      req.end();
    });
  }

  private sanitizeErrorMessage(message: string): string {
    // Truncate very long error messages and remove sensitive info
    return message.substring(0, 500).replace(/Bearer\s+[^\s]+/gi, 'Bearer [REDACTED]');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}