#!/bin/bash

# Setup Lambda functions for StayUp monitoring following uptimeMonitor pattern
# This script creates Lambda functions in multiple regions with SQS triggers

set -e

echo "🚀 Setting up StayUp Lambda monitoring functions..."

# Configuration
FUNCTION_NAME_PREFIX="stayup-monitor"
RUNTIME="nodejs18.x"
HANDLER="index.handler"
TIMEOUT=300  # 5 minutes (max for Lambda)
MEMORY_SIZE=512
ROLE_NAME="StayUpLambdaExecutionRole"

# Regions following uptimeMonitor's multi-region pattern
REGIONS=("us-east-1" "eu-west-1" "ap-south-1")

# Create IAM role if it doesn't exist
create_iam_role() {
    echo "📝 Creating IAM role: $ROLE_NAME..."
    
    # Check if role exists
    if aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1; then
        echo "✅ IAM role $ROLE_NAME already exists"
    else
        # Create role
        aws iam create-role \
            --role-name "$ROLE_NAME" \
            --assume-role-policy-document '{
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": {
                            "Service": "lambda.amazonaws.com"
                        },
                        "Action": "sts:AssumeRole"
                    }
                ]
            }'

        # Attach basic execution policy
        aws iam attach-role-policy \
            --role-name "$ROLE_NAME" \
            --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"

        # Attach SQS policy
        aws iam attach-role-policy \
            --role-name "$ROLE_NAME" \
            --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaSQSQueueExecutionRole"

        echo "✅ IAM role $ROLE_NAME created successfully"
        
        # Wait for role to propagate
        echo "⏳ Waiting for IAM role to propagate..."
        sleep 10
    fi
}

# Get AWS account ID
get_account_id() {
    aws sts get-caller-identity --query "Account" --output text
}

# Create SQS queue for a region
create_sqs_queue() {
    local region=$1
    local queue_name="stayup-monitor-queue-$region"
    
    echo "📮 Creating SQS queue: $queue_name in $region..."
    
    # Create DLQ first
    local dlq_name="$queue_name-dlq"
    local dlq_url
    dlq_url=$(aws sqs create-queue \
        --queue-name "$dlq_name" \
        --region "$region" \
        --attributes '{
            "MessageRetentionPeriod": "1209600",
            "VisibilityTimeoutSeconds": "300"
        }' \
        --query "QueueUrl" --output text 2>/dev/null || aws sqs get-queue-url --queue-name "$dlq_name" --region "$region" --query "QueueUrl" --output text)
    
    # Get DLQ ARN
    local dlq_arn
    dlq_arn=$(aws sqs get-queue-attributes \
        --queue-url "$dlq_url" \
        --attribute-names QueueArn \
        --region "$region" \
        --query "Attributes.QueueArn" --output text)
    
    # Create main queue with DLQ
    local queue_url
    queue_url=$(aws sqs create-queue \
        --queue-name "$queue_name" \
        --region "$region" \
        --attributes "{
            \"MessageRetentionPeriod\": \"1209600\",
            \"VisibilityTimeoutSeconds\": \"300\",
            \"ReceiveMessageWaitTimeSeconds\": \"20\",
            \"RedrivePolicy\": \"{\\\"deadLetterTargetArn\\\":\\\"$dlq_arn\\\",\\\"maxReceiveCount\\\":3}\"
        }" \
        --query "QueueUrl" --output text 2>/dev/null || aws sqs get-queue-url --queue-name "$queue_name" --region "$region" --query "QueueUrl" --output text)
    
    echo "✅ SQS queue created: $queue_url"
    echo "$queue_url"
}

# Create Lambda function for a region
create_lambda_function() {
    local region=$1
    local function_name="$FUNCTION_NAME_PREFIX-$region"
    local account_id
    account_id=$(get_account_id)
    local role_arn="arn:aws:iam::$account_id:role/$ROLE_NAME"
    
    echo "⚡ Creating Lambda function: $function_name in $region..."
    
    # Check if function exists
    if aws lambda get-function --function-name "$function_name" --region "$region" >/dev/null 2>&1; then
        echo "✅ Lambda function $function_name already exists"
        return
    fi
    
    # Create function
    aws lambda create-function \
        --function-name "$function_name" \
        --runtime "$RUNTIME" \
        --role "$role_arn" \
        --handler "$HANDLER" \
        --timeout "$TIMEOUT" \
        --memory-size "$MEMORY_SIZE" \
        --region "$region" \
        --zip-file fileb://../lambda-function.zip \
        --environment "Variables={
            API_ENDPOINT=$API_ENDPOINT,
            API_SECRET=$API_SECRET,
            AWS_REGION=$region
        }" \
        --description "StayUp uptime monitoring worker for $region"
    
    echo "✅ Lambda function $function_name created successfully"
}

# Create SQS trigger for Lambda function
create_sqs_trigger() {
    local region=$1
    local function_name="$FUNCTION_NAME_PREFIX-$region"
    local queue_url=$2
    local account_id
    account_id=$(get_account_id)
    
    # Get queue ARN
    local queue_arn
    queue_arn=$(aws sqs get-queue-attributes \
        --queue-url "$queue_url" \
        --attribute-names QueueArn \
        --region "$region" \
        --query "Attributes.QueueArn" --output text)
    
    echo "🔗 Creating SQS trigger for $function_name..."
    
    # Create event source mapping
    aws lambda create-event-source-mapping \
        --event-source-arn "$queue_arn" \
        --function-name "$function_name" \
        --batch-size 10 \
        --maximum-batching-window-in-seconds 0 \
        --region "$region" >/dev/null 2>&1 || echo "⚠️ SQS trigger may already exist"
    
    echo "✅ SQS trigger created for $function_name"
}

# Main execution
main() {
    # Check if environment variables are set
    if [[ -z "$API_ENDPOINT" || -z "$API_SECRET" ]]; then
        echo "❌ Error: API_ENDPOINT and API_SECRET environment variables must be set"
        echo "Example: export API_ENDPOINT=https://api.stayup.dev"
        echo "Example: export API_SECRET=your-secret-key"
        exit 1
    fi
    
    # Build Lambda function
    echo "🔨 Building Lambda function..."
    cd "$(dirname "$0")/.."
    npm run build
    npm run package
    
    # Create IAM role
    create_iam_role
    
    # Process each region
    for region in "${REGIONS[@]}"; do
        echo ""
        echo "🌍 Setting up monitoring in region: $region"
        
        # Create SQS queue
        queue_url=$(create_sqs_queue "$region")
        
        # Create Lambda function
        create_lambda_function "$region"
        
        # Create SQS trigger
        create_sqs_trigger "$region" "$queue_url"
        
        echo "✅ Region $region setup complete"
    done
    
    echo ""
    echo "🎉 All Lambda monitoring functions created successfully!"
    echo ""
    echo "📋 Summary:"
    for region in "${REGIONS[@]}"; do
        echo "   • Function: $FUNCTION_NAME_PREFIX-$region"
        echo "   • Queue: stayup-monitor-queue-$region"
        echo "   • Region: $region"
    done
    echo ""
    echo "🔧 Next steps:"
    echo "   1. Update your backend scheduler to send jobs to these SQS queues"
    echo "   2. Test the monitoring functions"
    echo "   3. Monitor CloudWatch logs for any issues"
}

# Run main function
main "$@"