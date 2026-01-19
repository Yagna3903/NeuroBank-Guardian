# 🏦 NeuroBank Guardian

![Status](https://img.shields.io/badge/Status-Beta-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Tech](https://img.shields.io/badge/Stack-Next.js_FastAPI_LangChain-purple)

**The Future of Banking is Conversational.**

**NeuroBank Guardian** is a next-generation, AI-powered banking assistant that transforms traditional financial interfaces into an intelligent, secure, and voice-activated experience. Powered by **Local LLMs**, **Real-Time Avatars**, and **Vector-Based RAG**, it allows users to manage their finances through natural conversation while keeping data 100% local and private.

---

## 🚀 Key Features

*   **🤖 Real-Time AI Avatar**: A lip-synced, emotionally responsive avatar that serves as your personal financial concierge.
*   **🗣️ Voice-Activated Banking**: Execute transactions, pay bills, and query accounts using natural voice commands (powered by Azure Speech SDK).
*   **🔐 Biometric "YES AI" Security**: High-value transactions require secure voice biometric confirmation.
*   **🧠 RAG-Powered Intelligence**: Instantly search thousands of transactions using semantic understanding (e.g., "How much did I spend on coffee last month?").
*   **🌐 Bilingual Support**: Native fluency in English and French, perfect for Canadian markets.
*   **🛡️ 100% Privacy**: Architecure designed for local data processing with zero unauthorized cloud egress.
*   **⚡ Real-Time Updates**: WebSocket integration ensures account balances update instantly across all devices.

---

## 🛠️ Technology Stack

### **Frontend**
*   **Framework**: Next.js 16 (App Router)
*   **Library**: React 19
*   **Styling**: TailwindCSS 4
*   **Icons**: Lucide React
*   **State**: Hooks & Context API

### **Backend**
*   **Framework**: FastAPI (Python 3.11)
*   **AI Orchestration**: LangChain
*   **LLM**: GPT-4o (Configurable for Local Llama 3)
*   **Voice Services**: Azure Cognitive Services (Speech-to-Text / Text-to-Speech)
*   **Real-Time**: WebSockets

### **Data & Infrastructure**
*   **Database**: MongoDB Atlas (NoSQL)
*   **Vector Search**: MongoDB Atlas Vector Search (768 Dimensions)
*   **Deployment**: Google Cloud Run (Dockerized)

---

## 📂 Project Structure

```bash
NeuroBank-Guardian/
├── backend/                 # Python FastAPI Backend
│   ├── config/             # Configuration & Database Connection
│   ├── controllers/        # API Route Controllers
│   ├── models/             # Pydantic Data Models
│   ├── routes/             # API Endpoints
│   ├── services/           # Core Logic (Agent, Audio, Transaction)
│   └── main.py             # Application Entry Point
├── frontend/                # Next.js Frontend
│   ├── app/                # App Router Pages
│   ├── components/         # Reusable UI Components
│   └── public/             # Static Assets
└── DEPLOY_GUIDE.md         # Cloud Deployment Instructions
```

---

## ⚡ Getting Started

Follow these steps to set up the project locally.

### Prerequisites
*   Node.js 18+
*   Python 3.10+
*   MongoDB Atlas Account
*   OpenAI API Key
*   Azure Speech Service Key

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/neurobank-guardian.git
cd neurobank-guardian
```

### 2. Backend Setup
Navigate to the backend directory and set up the Python environment.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

**Configure Environment Variables:**
Create a `.env` file in `backend/`:
```env
# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=neurobank_db

# AI & Voice Keys
OPENAI_API_KEY=your_openai_key
AZURE_SPEECH_KEY=your_azure_key
AZURE_SPEECH_REGION=eastus

# Security
SECRET_KEY=your_secret_key_for_jwt
```

**Run the Server:**
```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
Open a new terminal and navigate to the frontend directory.

```bash
cd ../frontend
npm install
```

**Configure Environment:**
Create a `.env.local` file in `frontend/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Run the Frontend:**
```bash
npm run dev
```

Visit `http://localhost:3000` to access NeuroBank Guardian.

---

## 🧪 Usage Guide

1.  **Login**: Use the demo email `yagna3903@gmail.com` or click "Enter Demo Mode".
2.  **Authenticate**: Enter the OTP displayed (default `000000` for demo users) and wait for the biometric animation.
3.  **Interact**:
    *   **Click the Microphone** and speak: *"What is my checking account balance?"*
    *   **Try a Transaction**: *"Pay $50 to my Hydro bill."* -> Confirm with *"YES AI"*.
    *   **Ask Insight**: *"How much have I spent on Uber this year?"*

---

## 🚢 Deployment

The project includes `Dockerfile` configurations for both implementation layers.

**Deploy to Google Cloud Run:**
Please refer to the detailed [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) for step-by-step production deployment instructions.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:
1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ by the NeuroBank Team
