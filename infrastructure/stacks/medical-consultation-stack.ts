import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as kms from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';

/**
 * Main infrastructure stack for AI Medical Consultation Platform
 * Sets up DynamoDB tables, S3 buckets, Cognito user pools, and encryption
 */
export class MedicalConsultationStack extends cdk.Stack {
  public readonly patientsTable: dynamodb.Table;
  public readonly consultationsTable: dynamodb.Table;
  public readonly symptomLogsTable: dynamodb.Table;
  public readonly documentMetadataTable: dynamodb.Table;
  public readonly documentBucket: s3.Bucket;
  public readonly userPool: cognito.UserPool;
  public readonly encryptionKey: kms.Key;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create KMS key for encryption at rest
    this.encryptionKey = new kms.Key(this, 'EncryptionKey', {
      description: 'KMS key for medical consultation platform data encryption',
      enableKeyRotation: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // ========================================================================
    // DynamoDB Tables
    // ========================================================================

    // Patients Table
    this.patientsTable = new dynamodb.Table(this, 'PatientsTable', {
      tableName: 'medical-consultation-patients',
      partitionKey: {
        name: 'patientId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.CUSTOMER_MANAGED,
      encryptionKey: this.encryptionKey,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Add GSI for email lookup
    this.patientsTable.addGlobalSecondaryIndex({
      indexName: 'email-index',
      partitionKey: {
        name: 'email',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Consultations Table
    this.consultationsTable = new dynamodb.Table(this, 'ConsultationsTable', {
      tableName: 'medical-consultation-consultations',
      partitionKey: {
        name: 'consultationId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'patientId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.CUSTOMER_MANAGED,
      encryptionKey: this.encryptionKey,
      pointInTimeRecovery: true,
      timeToLiveAttribute: 'ttl',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Add GSI for patient consultation history
    this.consultationsTable.addGlobalSecondaryIndex({
      indexName: 'patientId-status-index',
      partitionKey: {
        name: 'patientId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'status',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Add GSI for doctor queue
    this.consultationsTable.addGlobalSecondaryIndex({
      indexName: 'status-createdAt-index',
      partitionKey: {
        name: 'status',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Symptom Logs Table
    this.symptomLogsTable = new dynamodb.Table(this, 'SymptomLogsTable', {
      tableName: 'medical-consultation-symptom-logs',
      partitionKey: {
        name: 'consultationId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'timestamp',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.CUSTOMER_MANAGED,
      encryptionKey: this.encryptionKey,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Add GSI for patient timeline
    this.symptomLogsTable.addGlobalSecondaryIndex({
      indexName: 'patientId-timestamp-index',
      partitionKey: {
        name: 'patientId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'timestamp',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Document Metadata Table
    this.documentMetadataTable = new dynamodb.Table(this, 'DocumentMetadataTable', {
      tableName: 'medical-consultation-document-metadata',
      partitionKey: {
        name: 'documentId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.CUSTOMER_MANAGED,
      encryptionKey: this.encryptionKey,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Add GSI for consultation documents
    this.documentMetadataTable.addGlobalSecondaryIndex({
      indexName: 'consultationId-uploadedAt-index',
      partitionKey: {
        name: 'consultationId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'uploadedAt',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // ========================================================================
    // S3 Buckets
    // ========================================================================

    // Document Storage Bucket
    this.documentBucket = new s3.Bucket(this, 'DocumentBucket', {
      bucketName: `medical-consultation-documents-${this.account}`,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: this.encryptionKey,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      lifecycleRules: [
        {
          id: 'archive-old-documents',
          enabled: true,
          transitions: [
            {
              storageClass: s3.StorageClass.GLACIER,
              transitionAfter: cdk.Duration.days(365),
            },
          ],
        },
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // ========================================================================
    // Cognito User Pool
    // ========================================================================

    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'medical-consultation-users',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
        phone: true,
      },
      autoVerify: {
        email: true,
        phone: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        phoneNumber: {
          required: true,
          mutable: true,
        },
        givenName: {
          required: true,
          mutable: true,
        },
        familyName: {
          required: true,
          mutable: true,
        },
      },
      customAttributes: {
        role: new cognito.StringAttribute({ mutable: true }),
      },
      passwordPolicy: {
        minLength: 12,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_AND_PHONE_WITHOUT_MFA,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Create user pool client for web application
    const userPoolClient = this.userPool.addClient('WebClient', {
      userPoolClientName: 'medical-consultation-web-client',
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
        ],
      },
    });

    // Create user groups for role-based access control
    new cognito.CfnUserPoolGroup(this, 'PatientGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'Patients',
      description: 'Group for patient users',
    });

    new cognito.CfnUserPoolGroup(this, 'DoctorGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'Doctors',
      description: 'Group for doctor users',
    });

    new cognito.CfnUserPoolGroup(this, 'AdminGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'Admins',
      description: 'Group for administrator users',
    });

    // ========================================================================
    // Stack Outputs
    // ========================================================================

    new cdk.CfnOutput(this, 'PatientsTableName', {
      value: this.patientsTable.tableName,
      description: 'DynamoDB table for patient records',
    });

    new cdk.CfnOutput(this, 'ConsultationsTableName', {
      value: this.consultationsTable.tableName,
      description: 'DynamoDB table for consultation records',
    });

    new cdk.CfnOutput(this, 'SymptomLogsTableName', {
      value: this.symptomLogsTable.tableName,
      description: 'DynamoDB table for symptom logs',
    });

    new cdk.CfnOutput(this, 'DocumentMetadataTableName', {
      value: this.documentMetadataTable.tableName,
      description: 'DynamoDB table for document metadata',
    });

    new cdk.CfnOutput(this, 'DocumentBucketName', {
      value: this.documentBucket.bucketName,
      description: 'S3 bucket for document storage',
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
    });

    new cdk.CfnOutput(this, 'EncryptionKeyId', {
      value: this.encryptionKey.keyId,
      description: 'KMS encryption key ID',
    });
  }
}
