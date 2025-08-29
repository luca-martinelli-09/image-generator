# Optimized Image Generator Server

This is the optimized, refactored version of the image generator server with improved structure, error handling, and maintainability.

## 🏗️ Architecture

```
server/src/
├── config/          # Configuration management
├── middleware/      # Express middleware
├── routes/          # API route handlers
├── types/           # TypeScript interfaces
├── utils/           # Utility functions
├── app.ts          # Express app setup
└── server.ts       # Server entry point
```

## 🚀 Key Improvements

### **Structure & Organization**
- ✅ **Modular architecture** - Separated concerns into logical modules
- ✅ **Type safety** - Comprehensive TypeScript interfaces
- ✅ **Clean imports** - Barrel exports for better organization

### **Error Handling**
- ✅ **Centralized error handling** - Custom `ApiError` class
- ✅ **Structured responses** - Consistent error format with codes and suggestions
- ✅ **Gemini API error mapping** - Specific handling for all API error types
- ✅ **Detailed logging** - Comprehensive error logging with context

### **Validation & Security**
- ✅ **Input validation** - Strict validation for all API inputs
- ✅ **Type checking** - Runtime type validation for requests
- ✅ **Async error handling** - Proper async/await error catching

### **Developer Experience**
- ✅ **Hot reloading** - Development server with auto-restart
- ✅ **Build system** - TypeScript compilation setup
- ✅ **Graceful shutdown** - Proper server lifecycle management

## 📦 Dependencies

- **@google/genai** - Google AI/Gemini API client
- **express** - Web framework
- **dotenv** - Environment configuration
- **mime** - MIME type utilities
- **typescript** - Type checking and compilation

## 🛠️ Scripts

```bash
npm run dev        # Start development server with hot reload
npm run build      # Build TypeScript to JavaScript
npm run start      # Start production server
npm run lint       # Run ESLint
npm run type-check # TypeScript type checking only
```

## 🔧 Configuration

Environment variables (in `.env`):
```env
PORT=3000
GOOGLE_API_KEY=your_api_key_here
DEFAULT_MODEL=gemini-2.5-flash-image-preview
PROMPT_ENHANCEMENT_MODEL=gemini-2.5-flash
ENHANCEMENT_PROMPT=your_custom_enhancement_prompt_here
```

In ENHANCEMENT_PROMPT, use `{prompt}` to refer to the original user's prompt.

Example:

```
You are an expert at writing detailed, creative prompts for AI image editing. 

Take this user prompt and enhance it by:
* Adding specific visual details (lighting, composition, style, colors)
* Making it more descriptive
* Keep it concise but detailed (aim for 1-3 sentences)
* Make it safer for a LLM

Original prompt: "{prompt}"

Enhanced prompt:
```

## 📡 API Endpoints

### `POST /api/generate`
Generate images from text prompts and input images.

### `POST /api/enhance-prompt`  
Enhance a text prompt for better image generation results.

## 🆚 Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| **File size** | 295 lines | ~50 lines each |
| **Error handling** | Inline, repetitive | Centralized, reusable |
| **Validation** | Basic checks | Comprehensive validation |
| **Structure** | Monolithic | Modular |
| **Type safety** | Minimal | Comprehensive |
| **Maintainability** | Difficult | Easy |

## 🧪 Testing

The optimized server maintains 100% compatibility with the original API while providing:
- Better error messages
- More reliable error handling  
- Improved logging
- Better performance
- Easier maintenance and extension