#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MedicalConsultationStack } from './stacks/medical-consultation-stack';

const app = new cdk.App();

new MedicalConsultationStack(app, 'MedicalConsultationStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  description: 'AI-Powered Medical Consultation Platform Infrastructure',
});

app.synth();
