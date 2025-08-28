# 🎨 AI Image Generator

A powerful, full-stack web application for AI-powered image generation and enhancement using Google's Generative AI. Built with React, TypeScript, and Express, featuring a modern interface with drag-and-drop functionality and project management capabilities.

## ✨ Features

- 🖼️ **AI Image Generation** - Generate stunning images from text prompts using Google's Gemini AI
- 🔧 **Image Enhancement** - Enhance existing images with AI-powered upscaling and improvements  
- 📁 **Project Management** - Save and organize your image generation projects
- 💾 **Prompt Library** - Save frequently used prompts for quick access
- 🖱️ **Drag & Drop Interface** - Intuitive file upload with drag-and-drop support
- 🎯 **Batch Processing** - Generate multiple variations from a single prompt
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- ⚡ **Real-time Preview** - Instant preview of uploaded images and generated outputs
- 🐳 **Docker Support** - Easy deployment with Docker containers

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Google AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd image-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd server && npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file in the server directory
   echo "GOOGLE_AI_API_KEY=your_api_key_here" > server/.env
   ```

4. **Run the application**
   ```bash
   # Development mode (runs both client and server)
   npm run dev:full
   
   # Or run separately
   npm run server  # Backend server
   npm run dev     # Frontend client
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🐳 Docker Deployment

Run the entire application stack with Docker:

```bash
docker-compose up -d
```

This will start both the frontend and backend services with proper networking configuration.

## 🏗️ Project Structure

```
image-generator/
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── server/                # Express backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── types/         # Server type definitions
│   │   └── utils/         # Server utilities
│   └── dist/              # Compiled server code
├── docker-compose.yml     # Docker configuration
└── Dockerfile            # Docker build instructions
```

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Dropzone** - Drag-and-drop file uploads

### Backend
- **Express 5** - Fast, minimalist web framework
- **TypeScript** - Full-stack type safety
- **Google Generative AI** - Powerful AI image generation
- **Node.js** - JavaScript runtime

### DevOps
- **Docker** - Containerization
- **ESLint** - Code linting
- **Concurrently** - Run multiple commands

## 🔧 Development Scripts

```bash
npm run dev          # Start frontend development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
npm run server       # Start backend server
npm run dev:full     # Start both frontend and backend
```

## 📝 API Endpoints

- `POST /api/generate` - Generate images from text prompts
- `POST /api/enhance` - Enhance existing images
- `GET /api/health` - Health check endpoint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google Generative AI for powerful image generation capabilities
- React and Vite communities for excellent developer tools
- Tailwind CSS for beautiful, responsive styling

---

**Happy generating!** 🎨✨