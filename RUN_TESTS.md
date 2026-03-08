# Running Task 1.1 Encryption Tests

## Current Status

Task 1.1 requires running property-based tests for data model encryption (Property 20).

The test file `src/utils/encryption.test.ts` has been created and validates:
- ✓ All DynamoDB tables have KMS encryption enabled
- ✓ All S3 buckets have KMS encryption enabled
- ✓ Customer-managed KMS keys are used (not AWS-managed)
- ✓ Encryption configuration is immutable

## Prerequisites

Before running the tests, ensure:

1. **Node.js is installed and in PATH**
   - Check: `node --version` (should show v18+)
   - If not installed: Download from https://nodejs.org/

2. **Dependencies are installed**
   ```bash
   npm install
   ```

3. **Infrastructure is deployed**
   
   **Option A: Local Development with LocalStack**
   ```bash
   # Start LocalStack
   npm run local
   
   # In another terminal, initialize resources
   npm run local:init
   
   # Verify infrastructure
   npm run validate
   ```
   
   **Option B: AWS Deployment**
   ```bash
   # Configure AWS credentials
   aws configure
   
   # Deploy infrastructure
   npm run cdk:deploy
   ```

## Running the Encryption Test

Once prerequisites are met:

```bash
# Run the specific encryption test
npm test -- encryption.test.ts

# Or run all tests
npm test
```

## Expected Output

### Success (LocalStack)
```
PASS  src/utils/encryption.test.ts
  Property 20: Data Encryption at Rest
    DynamoDB Table Encryption
      ✓ all DynamoDB tables should have encryption enabled (XXXms)
      ✓ each medical consultation table should use customer-managed KMS key (XXXms)
    S3 Bucket Encryption
      ✓ all S3 buckets should have encryption enabled (XXXms)
      ✓ document bucket should use customer-managed KMS key (XXXms)
    Encryption Property Invariants
      ✓ encryption configuration should be immutable once set (XXXms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
```

### Success (AWS)
Same as above, but with full KMS validation (LocalStack skips some KMS checks).

### Failure Examples

**Infrastructure not deployed:**
```
Error: ResourceNotFoundException: Table not found
```
→ Solution: Deploy infrastructure first

**No encryption configured:**
```
Error: Bucket medical-consultation-documents does not have encryption configured
```
→ Solution: Check CDK stack configuration

## TypeScript Errors in IDE

You may see TypeScript errors in the IDE like:
- "Cannot find name 'describe'"
- "Cannot find name 'test'"
- "Cannot find name 'expect'"

**These are harmless!** They occur because the IDE doesn't recognize Jest globals, but the tests will run fine with Jest. The `jest.config.js` and `@types/jest` package handle this at runtime.

## Next Steps

After the tests pass:
1. Mark Task 1.1 as complete
2. Proceed to Task 2: Implement Symptom Processor component

## Troubleshooting

### Node.js not found
```
node : The term 'node' is not recognized...
```
**Solution**: Install Node.js 18+ from https://nodejs.org/ and restart your terminal

### LocalStack connection refused
```
Error: connect ECONNREFUSED 127.0.0.1:4566
```
**Solution**: 
```bash
docker ps  # Check if LocalStack is running
npm run local  # Start LocalStack if not running
```

### AWS credentials not configured
```
Error: Missing credentials in config
```
**Solution**:
```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, and region
```

### Tests timeout
```
Error: Timeout - Async callback was not invoked within the 30000ms timeout
```
**Solution**: Check that infrastructure is actually deployed and accessible

## Test File Location

The encryption test is located at:
```
src/utils/encryption.test.ts
```

It validates **Property 20: Data Encryption at Rest** from the design document, which corresponds to **Requirement 10.1** in the requirements document.
