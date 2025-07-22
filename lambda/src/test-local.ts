import { MonitorWorker } from './monitor';
import { MonitorJob, MONITOR_REGION, HTTP_METHOD } from '@stayup/shared-types';

/**
 * Local testing script for Lambda monitoring functionality
 * Following uptimeMonitor's test-local pattern
 */

async function testMonitorWorker() {
  console.log('Starting local Lambda monitor test...');

  // Set up test environment
  process.env.API_ENDPOINT = 'https://your-api-endpoint.com';
  process.env.API_SECRET = 'test-secret';
  process.env.AWS_REGION = 'us-east-1';

  const worker = new MonitorWorker();

  // Test job data following uptimeMonitor pattern
  const testJobs: MonitorJob[] = [
    {
      monitorId: 'test-monitor-1',
      url: 'https://httpbin.org/status/200',
      method: HTTP_METHOD.GET,
      expectedStatusCodes: [200, 201, 202, 204],
      timeout: 30,
      retries: 2,
      headers: null,
      body: null,
      region: MONITOR_REGION.US_EAST,
    },
    {
      monitorId: 'test-monitor-2',
      url: 'https://httpbin.org/status/500',
      method: HTTP_METHOD.GET,
      expectedStatusCodes: [200, 201, 202, 204],
      timeout: 30,
      retries: 2,
      headers: null,
      body: null,
      region: MONITOR_REGION.US_EAST,
    },
    {
      monitorId: 'test-monitor-3',
      url: 'https://httpbin.org/delay/35', // Should timeout
      method: HTTP_METHOD.GET,
      expectedStatusCodes: [200, 201, 202, 204],
      timeout: 30,
      retries: 1,
      headers: null,
      body: null,
      region: MONITOR_REGION.US_EAST,
    },
    {
      monitorId: 'test-monitor-4',
      url: 'https://httpbin.org/post',
      method: HTTP_METHOD.POST,
      expectedStatusCodes: [200, 201, 202, 204],
      timeout: 30,
      retries: 2,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'data' }),
      region: MONITOR_REGION.US_EAST,
    },
  ];

  const results = [];

  // Execute each test job
  for (const job of testJobs) {
    try {
      console.log(`\nTesting monitor: ${job.monitorId}`);
      console.log(`URL: ${job.url}`);
      console.log(`Method: ${job.method}`);
      console.log(`Expected status codes: ${job.expectedStatusCodes.join(', ')}`);

      const result = await worker.executeMonitorCheck(job);
      
      console.log('✅ Result:', {
        status: result.status,
        responseTime: result.responseTime,
        statusCode: result.statusCode,
        errorMessage: result.errorMessage,
      });

      results.push(result);
    } catch (error) {
      console.error(`❌ Error testing ${job.monitorId}:`, error.message);
    }
  }

  // Test sending results (will fail without proper API endpoint, but tests the logic)
  console.log('\nTesting result sending...');
  try {
    await worker.sendResults(results, 'test-request-id');
    console.log('✅ Results sent successfully');
  } catch (error) {
    console.log('⚠️ Expected failure sending results (no real API endpoint):', error.message);
  }

  console.log('\nLocal test completed!');
  console.log(`Processed ${results.length} monitoring jobs`);
}

// Run the test
if (require.main === module) {
  testMonitorWorker().catch(console.error);
}