# StayUp Lambda Monitoring Workers

This directory contains the AWS Lambda functions that perform the actual website monitoring, following the uptimeMonitor architecture pattern.

## Architecture

The Lambda monitoring system follows a multi-region approach similar to uptimeMonitor:

- **US East (us-east-1)**: Primary monitoring region
- **EU West (eu-west-1)**: European monitoring coverage
- **Asia Pacific South (ap-south-1)**: Asian monitoring coverage

## Components

### Core Files

- `src/index.ts` - Main Lambda handler for SQS events
- `src/monitor.ts` - HTTP monitoring logic with retry and timeout handling  
- `src/types.ts` - Shared TypeScript types and Zod validation schemas
- `src/test-local.ts` - Local testing script for development

### Deployment Scripts

- `scripts/setup-lambda-functions.sh` - Automated setup of Lambda functions and SQS queues
- `package.json` - Build and deployment scripts

## How It Works

1. **Job Scheduling**: The NestJS backend sends monitoring jobs to regional SQS queues
2. **SQS Triggers**: Lambda functions are triggered by SQS messages (up to 10 per invocation)
3. **HTTP Monitoring**: Each function performs HTTP requests with timeout and retry logic
4. **Result Reporting**: Results are sent back to the backend via webhook API
5. **Error Handling**: Failed jobs are retried and sent to dead letter queues

## Environment Variables

The Lambda functions require these environment variables:

```bash
API_ENDPOINT=https://your-backend-api.com
API_SECRET=your-internal-api-secret
AWS_REGION=us-east-1  # Set automatically by AWS
```

## Deployment

### Prerequisites

1. AWS CLI configured with appropriate permissions
2. Node.js and npm installed
3. Backend API endpoint and secret configured

### Setup Process

1. **Set environment variables:**
   ```bash
   export API_ENDPOINT=https://your-api.com
   export API_SECRET=your-secret-key
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run setup script:**
   ```bash
   ./scripts/setup-lambda-functions.sh
   ```

This will create:
- IAM role with necessary permissions
- SQS queues in each region with dead letter queues
- Lambda functions in each region
- Event source mappings between SQS and Lambda

### Manual Deployment

For updates after initial setup:

```bash
# Build and deploy to all regions
npm run build:lambda
npm run deploy:all

# Or deploy to specific regions
npm run deploy:us-east
npm run deploy:eu-west
npm run deploy:ap-south
```

## Local Testing

Test the monitoring logic locally:

```bash
npm run test:local
```

This will test various scenarios:
- Successful HTTP requests (200 OK)
- Failed requests (500 errors)
- Timeout handling
- POST requests with body
- Result formatting and validation

## Monitoring

Monitor your Lambda functions using:

- **CloudWatch Logs**: `/aws/lambda/stayup-monitor-{region}`
- **CloudWatch Metrics**: Function duration, errors, throttles
- **SQS Metrics**: Queue depth, message processing rates
- **Dead Letter Queues**: Failed message handling

## SQS Queue Configuration

Each region has:
- **Main Queue**: `stayup-monitor-queue-{region}`
  - Visibility timeout: 5 minutes (matches Lambda timeout)
  - Message retention: 14 days
  - Dead letter queue: After 3 failed attempts
  
- **Dead Letter Queue**: `stayup-monitor-queue-{region}-dlq`
  - Message retention: 14 days
  - For analyzing failed monitoring jobs

## Job Processing

Lambda functions process SQS messages with these characteristics:
- **Batch Size**: Up to 10 messages per invocation
- **Timeout**: 5 minutes maximum
- **Retry Logic**: 3 attempts with exponential backoff
- **Parallel Processing**: Multiple regions can monitor the same endpoints

## Error Handling

The system handles various error scenarios:
- **Network timeouts**: Configurable per monitor
- **DNS resolution failures**: Treated as DOWN status
- **HTTP errors**: Status code validation against expected codes
- **Lambda failures**: Messages returned to queue for retry
- **API failures**: Results cached and retried

## Security

- **IAM Roles**: Minimal permissions (SQS, CloudWatch Logs)
- **API Authentication**: Internal secret for webhook communication
- **Error Sanitization**: Sensitive data removed from error messages
- **Network Isolation**: Lambda functions run in AWS managed network

## Cost Optimization

- **On-demand pricing**: Pay only for actual monitoring requests
- **Efficient batching**: Process up to 10 monitors per invocation
- **Regional distribution**: Reduce cross-region data transfer
- **Dead letter queues**: Prevent infinite retry loops

## Performance

- **Cold starts**: ~100-200ms for Node.js runtime
- **Warm execution**: ~10-50ms overhead per monitor
- **Concurrent execution**: Up to 1000 concurrent invocations per region
- **Throughput**: Thousands of monitors per minute per region

## Troubleshooting

### Common Issues

1. **Permission errors**: Check IAM role has SQS and CloudWatch permissions
2. **Timeout errors**: Increase Lambda timeout or reduce monitor timeout
3. **API connectivity**: Verify API_ENDPOINT is accessible from Lambda
4. **Message format**: Ensure SQS messages match MonitorJob schema

### Logs Analysis

Check CloudWatch logs for:
- Job processing success/failure rates
- HTTP response times and error patterns
- API webhook delivery status
- SQS message consumption rates

### Scaling

Lambda automatically scales but consider:
- **Concurrent executions**: Default limit 1000 per region
- **SQS throughput**: Up to 300 TPS per region
- **API rate limits**: Backend webhook endpoint capacity
- **Cost vs. frequency**: Balance monitoring frequency with costs