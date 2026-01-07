# OCR Logging Guide

## Overview
Comprehensive logging has been added to the OCR functionality to help debug failures. The logs cover the entire flow from client-side file upload to server-side processing and Gemini API interaction.

## Log Locations

### 1. Client-Side Logs (Browser Console)

#### File Selection (`ApplyClaim.jsx`)
```
📎 [OCR Client] File selected: Yes/No
📄 [OCR Client] File details:
    Name: document.jpg
    Type: image/jpeg
    Size: 1234567 bytes (1.18 MB)
    Last modified: 2026-01-07T...
```

#### API Call Tracking (`api.js`)
```
🌐 [API] Request to /policies/ocr
    Method: POST
    Has token: true
    Body type: FormData
    FormData[document]: File(document.jpg, 1234567 bytes, image/jpeg)
    Headers: Authorization, ...
🚀 [API] Sending request...
✅ [API] Response received in 2345.67ms
    Status: 200 OK
    Content-Type: application/json
    Success: true
✅ [API] Request successful
    Response data keys: extracted, confidence, message
```

#### OCR Result Processing
```
✅ [OCR Client] OCR completed in 2345.67ms
📊 [OCR Client] Result:
    Confidence: high
    Message: Successfully extracted policy details.
    Extracted data: {...}
✅ [OCR Client] Setting policy data from extracted information
    Setting policy number: POL-12345
```

### 2. Server-Side Logs (Terminal/Console)

#### Service Initialization (`geminiService.js`)
```
🔧 [Gemini] Initializing Gemini Service...
    API Key present: true
    API Key length: 39
    API Key prefix: AIzaSyB...
    Model: gemini-2.5-flash (default)
```

#### Multer File Upload (`policies.js`)
```
📁 [Policies Routes] Configuring multer for file uploads...
    Storage: memory
    File size limit: 10 MB

🔍 [Multer] File filter check:
    Original name: document.jpg
    MIME type: image/jpeg
    Field name: document
✅ [Multer] File accepted
```

#### OCR Request Processing (`policies.js`)
```
=== OCR REQUEST STARTED ===
Timestamp: 2026-01-07T10:30:45.123Z
Request headers: {...}

✅ File received:
  - Original name: document.jpg
  - MIME type: image/jpeg
  - Size: 1234567 bytes (1.18 MB)
  - Field name: document
  - Buffer length: 1234567

📝 Base64 encoding complete
  - Base64 string length: 1646756
  - First 50 chars: /9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAIBAQEBAQIBAQE...
```

#### Gemini API Interaction (`geminiService.js`)
```
📸 [OCR] extractTextFromImage called
    MIME type: image/jpeg
    Base64 length: 1646756
    Model: gemini-2.5-flash

🤖 [OCR] Initializing Gemini model...
✅ [OCR] Model initialized successfully

📝 [OCR] Prompt prepared (length: 245 chars)

🚀 [OCR] Sending request to Gemini API...
✅ [OCR] Gemini API response received in 2345 ms

📄 [OCR] Response text length: 567
📄 [OCR] Response preview: {
  "policyNumber": "POL-12345",
  "holderName": "John Doe",
  ...

🔍 [OCR] Attempting to parse response as JSON...
✅ [OCR] JSON pattern found, length: 567
📝 [OCR] JSON string preview: {
  "policyNumber": "POL-12345",
  ...
✅ [OCR] Successfully parsed JSON
📊 [OCR] Parsed object keys: policyNumber, holderName, type, coverageAmount, startDate, endDate
```

#### Retry Mechanism (`errorHandler.js`)
```
🔄 [Retry] Starting with max 3 retries, base delay 1000ms
🔄 [Retry] Attempt 1/3...
❌ [Retry] Attempt 1/3 failed
    Error: Request timeout
    Type: Error
    Status: 500
⏳ [Retry] Waiting 1000ms before next attempt...
🔄 [Retry] Attempt 2/3...
✅ [Retry] Succeeded on attempt 2
```

#### Success Response
```
✅ OCR Processing completed in 2345 ms
📊 Extracted data: {
  "policyNumber": "POL-12345",
  "holderName": "John Doe",
  ...
}
🎯 Confidence level: high
✅ Structured data successfully extracted
    Fields found: policyNumber, holderName, type, coverageAmount, startDate, endDate

=== OCR REQUEST COMPLETED SUCCESSFULLY ===
```

#### Error Cases
```
=== OCR ERROR ===
❌ Error type: Error
❌ Error message: Request failed with status code 500
❌ Error stack: Error: Request failed...
❌ API Response status: 500
❌ API Response data: {...}
❌ Error code: INTERNAL_ERROR

=== OCR REQUEST FAILED ===
```

## Common Error Patterns to Look For

### 1. API Key Issues
```
❌ [Gemini] GEMINI_API_KEY is not set in environment variables!
⚠️  [Gemini] GEMINI_API_KEY seems too short, may be invalid
```

### 2. File Upload Issues
```
❌ [Multer] File rejected - invalid MIME type
❌ OCR Error: No file uploaded in request
⚠️  Invalid MIME type: application/pdf
    Valid types: image/jpeg, image/jpg, image/png, image/gif, image/webp
```

### 3. JSON Parsing Issues
```
❌ [OCR] JSON parsing failed: Unexpected token
⚠️  [OCR] No JSON pattern found in response
⚠️  [OCR] Falling back to raw text response
```

### 4. Network/Timeout Issues
```
❌ [Retry] Attempt 1/3 failed
    Error: ETIMEDOUT
    Code: ETIMEDOUT
⏳ [Retry] Waiting 1000ms before next attempt...
❌ [Retry] All 3 attempts exhausted
```

### 5. Model/API Issues
```
❌ Error: Model not found
❌ Error: API quota exceeded
❌ Error: Invalid request payload
```

## Debugging Tips

1. **Check Browser Console First**: Look for client-side errors in file selection or API calls
2. **Verify File Format**: Ensure the file is a valid image (JPEG, PNG, GIF, WebP)
3. **Check API Key**: Verify GEMINI_API_KEY is set correctly in `.env`
4. **Monitor Processing Time**: Long delays may indicate network issues or API slowdowns
5. **Review Extracted Data**: Check if the JSON parsing succeeded and all fields are present
6. **Check Retry Attempts**: Multiple retries indicate intermittent failures

## Environment Variables to Check

```bash
GEMINI_API_KEY=your_api_key_here
MODEL=gemini-2.5-flash
NODE_ENV=development
```

## Testing OCR

1. Start the server and watch for initialization logs
2. Upload a test policy document image
3. Monitor both browser console and server terminal
4. Check the complete flow from file selection to final response
5. Look for any ❌ or ⚠️  symbols indicating issues

## Log Symbols Reference

- ✅ Success/Confirmation
- ❌ Error/Failure
- ⚠️  Warning/Attention needed
- 📎 File operation
- 🌐 Network/API call
- 🚀 Request sent
- 🔧 Configuration/Setup
- 📊 Data/Results
- 🔍 Inspection/Analysis
- 🔄 Retry operation
- 🤖 AI/Model operation
- 📝 Text/Content
- 🎯 Target/Goal
- 🏁 Completion
- ⏳ Waiting/Delay
