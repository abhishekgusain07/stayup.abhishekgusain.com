import { SQSEvent, SQSRecord, Context } from 'aws-lambda';
import { MonitorWorker } from './monitor';
import { MonitorJobSchema, MonitorJobResultSchema, MONITOR_REGION } from '@stayup/shared-types';

const worker = new MonitorWorker();

/**
 * AWS Lambda handler for SQS-triggered monitoring jobs
 * Following uptimeMonitor's Lambda architecture pattern
 */
export const handler = async (event: SQSEvent, context: Context) => {
  console.log('Lambda function started', {
    requestId: context.awsRequestId,
    region: process.env.AWS_REGION,
    recordCount: event.Records.length,
  });

  const results: any[] = [];
  const errors: any[] = [];

  // Process up to 10 SQS messages per invocation (following uptimeMonitor pattern)
  for (const record of event.Records) {
    try {
      const result = await processMonitorJob(record);
      results.push(result);
    } catch (error) {
      console.error('Error processing monitor job:', {
        messageId: record.messageId,
        error: error.message,
        body: record.body,
      });
      
      errors.push({
        messageId: record.messageId,
        error: error.message,
        body: record.body,
      });
    }
  }

  // Send results back to the main API following uptimeMonitor pattern
  if (results.length > 0) {
    try {
      await worker.sendResults(results, context.awsRequestId);
      console.log(`Successfully sent ${results.length} monitoring results`);
    } catch (error) {
      console.error('Error sending results to API:', error);
    }
  }

  // Log summary
  console.log('Lambda function completed', {
    requestId: context.awsRequestId,
    processedJobs: results.length,
    failedJobs: errors.length,
  });

  return {
    statusCode: 200,
    processedJobs: results.length,
    failedJobs: errors.length,
    errors: errors.length > 0 ? errors : undefined,
  };
};

async function processMonitorJob(record: SQSRecord) {
  try {
    // Parse and validate SQS message following uptimeMonitor pattern
    const jobData = JSON.parse(record.body);
    const validatedJob = MonitorJobSchema.parse(jobData);

    console.log('Processing monitor job:', {
      messageId: record.messageId,
      monitorId: validatedJob.monitorId,
      url: validatedJob.url,
      method: validatedJob.method,
      region: validatedJob.region,
    });

    // Execute monitoring check
    const result = await worker.executeMonitorCheck(validatedJob);

    // Validate result before returning
    const validatedResult = MonitorJobResultSchema.parse(result);

    console.log('Monitor check completed:', {
      messageId: record.messageId,
      monitorId: validatedJob.monitorId,
      status: validatedResult.status,
      responseTime: validatedResult.responseTime,
      statusCode: validatedResult.statusCode,
    });

    return validatedResult;
  } catch (error) {
    console.error('Error in processMonitorJob:', {
      messageId: record.messageId,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}