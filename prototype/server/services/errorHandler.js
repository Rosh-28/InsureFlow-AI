// Centralized error handling

export class AppError extends Error {
  constructor(message, statusCode, code = 'UNKNOWN_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_ERROR';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
  }

  if (err.name === 'MulterError') {
    statusCode = 400;
    code = 'FILE_UPLOAD_ERROR';
    message = getMulterErrorMessage(err);
  }

  // Gemini API errors
  if (err.message?.includes('API key')) {
    statusCode = 401;
    code = 'API_KEY_ERROR';
    message = 'Invalid or missing API key';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

function getMulterErrorMessage(err) {
  switch (err.code) {
    case 'LIMIT_FILE_SIZE':
      return 'File too large. Maximum size is 10MB.';
    case 'LIMIT_FILE_COUNT':
      return 'Too many files. Maximum is 5 files.';
    case 'LIMIT_UNEXPECTED_FILE':
      return 'Unexpected file field.';
    default:
      return 'File upload error.';
  }
}

// Async handler wrapper to catch errors
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Retry with exponential backoff
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  console.log(`🔄 [Retry] Starting with max ${maxRetries} retries, base delay ${baseDelay}ms`);
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`🔄 [Retry] Attempt ${i + 1}/${maxRetries}...`);
      const result = await fn();
      
      if (i > 0) {
        console.log(`✅ [Retry] Succeeded on attempt ${i + 1}`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      const delayMs = baseDelay * Math.pow(2, i);
      
      console.error(`❌ [Retry] Attempt ${i + 1}/${maxRetries} failed`);
      console.error(`    Error: ${error.message}`);
      console.error(`    Type: ${error.constructor.name}`);
      
      if (error.status) {
        console.error(`    Status: ${error.status}`);
      }
      
      if (error.code) {
        console.error(`    Code: ${error.code}`);
      }
      
      if (i < maxRetries - 1) {
        console.log(`⏳ [Retry] Waiting ${delayMs}ms before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        console.error(`❌ [Retry] All ${maxRetries} attempts exhausted`);
      }
    }
  }
  
  console.error('❌ [Retry] Final error:', lastError.message);
  throw lastError;
};
