#!/bin/bash

# Script to initialize LocalStack with DynamoDB tables and S3 buckets
# Run this after starting LocalStack with docker-compose

ENDPOINT="http://localhost:4566"
REGION="us-east-1"

echo "Initializing LocalStack resources..."

# Create KMS key
echo "Creating KMS encryption key..."
aws --endpoint-url=$ENDPOINT kms create-key \
  --description "Medical consultation platform encryption key" \
  --region $REGION

# Create DynamoDB tables
echo "Creating DynamoDB tables..."

# Patients Table
aws --endpoint-url=$ENDPOINT dynamodb create-table \
  --table-name medical-consultation-patients \
  --attribute-definitions \
    AttributeName=patientId,AttributeType=S \
    AttributeName=email,AttributeType=S \
  --key-schema \
    AttributeName=patientId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    "[{\"IndexName\":\"email-index\",\"KeySchema\":[{\"AttributeName\":\"email\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" \
  --region $REGION

# Consultations Table
aws --endpoint-url=$ENDPOINT dynamodb create-table \
  --table-name medical-consultation-consultations \
  --attribute-definitions \
    AttributeName=consultationId,AttributeType=S \
    AttributeName=patientId,AttributeType=S \
    AttributeName=status,AttributeType=S \
    AttributeName=createdAt,AttributeType=S \
  --key-schema \
    AttributeName=consultationId,KeyType=HASH \
    AttributeName=patientId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    "[{\"IndexName\":\"patientId-status-index\",\"KeySchema\":[{\"AttributeName\":\"patientId\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"status\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}},{\"IndexName\":\"status-createdAt-index\",\"KeySchema\":[{\"AttributeName\":\"status\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"createdAt\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" \
  --region $REGION

# Symptom Logs Table
aws --endpoint-url=$ENDPOINT dynamodb create-table \
  --table-name medical-consultation-symptom-logs \
  --attribute-definitions \
    AttributeName=consultationId,AttributeType=S \
    AttributeName=timestamp,AttributeType=S \
    AttributeName=patientId,AttributeType=S \
  --key-schema \
    AttributeName=consultationId,KeyType=HASH \
    AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    "[{\"IndexName\":\"patientId-timestamp-index\",\"KeySchema\":[{\"AttributeName\":\"patientId\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"timestamp\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" \
  --region $REGION

# Document Metadata Table
aws --endpoint-url=$ENDPOINT dynamodb create-table \
  --table-name medical-consultation-document-metadata \
  --attribute-definitions \
    AttributeName=documentId,AttributeType=S \
    AttributeName=consultationId,AttributeType=S \
    AttributeName=uploadedAt,AttributeType=S \
  --key-schema \
    AttributeName=documentId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    "[{\"IndexName\":\"consultationId-uploadedAt-index\",\"KeySchema\":[{\"AttributeName\":\"consultationId\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"uploadedAt\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" \
  --region $REGION

# Create S3 bucket
echo "Creating S3 bucket..."
aws --endpoint-url=$ENDPOINT s3 mb s3://medical-consultation-documents \
  --region $REGION

# Create Cognito User Pool
echo "Creating Cognito User Pool..."
aws --endpoint-url=$ENDPOINT cognito-idp create-user-pool \
  --pool-name medical-consultation-users \
  --policies "PasswordPolicy={MinimumLength=12,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=true}" \
  --auto-verified-attributes email phone_number \
  --region $REGION

echo "LocalStack initialization complete!"
echo "Tables created:"
echo "  - medical-consultation-patients"
echo "  - medical-consultation-consultations"
echo "  - medical-consultation-symptom-logs"
echo "  - medical-consultation-document-metadata"
echo "Bucket created:"
echo "  - medical-consultation-documents"
