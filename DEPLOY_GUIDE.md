# 🚀 Deployment Guide: NeuroBank Guardian on Google Cloud

## ✅ Pre-Flight Checklist (Verified)
- [x] **Frontend**: configured to read backend URL from environment.
- [x] **Backend**: CORS configured to accept connections from anywhere (hackathon mode).
- [x] **Database**: MongoDB Atlas Network Access allows `0.0.0.0/0` (Check this!).
- [x] **Docker**: Build files ready for both services.

---

## 🧠 Concepts Explained

1.  **Deployment**: Currently, your app runs only on your laptop (`localhost`). "Deploying" means moving it to a public server so anyone on the internet can access it.
2.  **GCP (Google Cloud Platform)**: A collection of cloud services. We are using **Cloud Run**.
3.  **Cloud Run**: Think of this as a "Serverless" system. You give it a "Container" (a box containing your code + dependencies), and it runs it. It scales automatically (0 to 1000s of users) and you only pay when code is actually running.
4.  **Docker**: The tool we use to wrap your code into that "Container". The `Dockerfile` is the recipe for creating the container.

---

## ✅ Deployment Steps

Since you have free hackathon credits, follow these steps to get your app live!

### Prerequisites

1.  **Claim Your Credits**: Use the link provided by your organizers.
2.  **Install gcloud CLI**: If not installed, [download it here](https://cloud.google.com/sdk/docs/install).
3.  **Login**: Run `gcloud auth login` in your terminal.
4.  **Set Project**: Run `gcloud config set project [YOUR_PROJECT_ID]`. (Find your Project ID in the GCP Console dashboard).

---

### Step 1: Deploy Backend

The backend needs to be deployed first so we can get its URL.

1.  **Enable Services** (Run once):
    ```bash
    gcloud services enable artifactregistry.googleapis.com run.googleapis.com cloudbuild.googleapis.com
    ```

2.  **Build Configuration**:
    Run this from the root `NeuroBank-Guardian` folder:
    ```bash
    gcloud builds submit --tag gcr.io/$(gcloud config get-value project)/backend ./backend
    ```

3.  **Deploy Service**:
    *   Replace `[YOUR_REAL_MONGO_CONNECTION_STRING]` with your actual MongoDB Atlas connection string.
    *   **Tip**: Ensure your MongoDB Atlas Network Access whitelist includes `0.0.0.0/0` (Allow IP form Anywhere) so Cloud Run can connect.
    ```bash
    gcloud run deploy backend \
      --image gcr.io/$(gcloud config get-value project)/backend \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated \
      --set-env-vars MONGO_URI="[YOUR_REAL_MONGO_CONNECTION_STRING]",OPENAI_API_KEY="[YOUR_OPENAI_KEY]",AZURE_SPEECH_KEY="[YOUR_KEY]",AZURE_SPEECH_REGION="[YOUR_REGION]"
    ```

4.  **Copy Backend URL**:
    After deployment, it will print a URL (e.g., `https://backend-xyz.a.run.app`). **Copy this URL.**

---

### Step 2: Deploy Frontend

Now we deploy the frontend and tell it where the backend lives.

1.  **Build with Backend URL**:
    Replace `[BACKEND_URL]` with the URL you just copied (ensure no trailing slash).
    ```bash
    gcloud builds submit --config frontend/cloudbuild.yaml --substitutions=_API_URL="[BACKEND_URL]" ./frontend
    ```

2.  **Deploy Frontend**:
    ```bash
    gcloud run deploy frontend \
      --image gcr.io/$(gcloud config get-value project)/frontend \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated
    ```

---

## 🎉 Done!
The command will output your **Frontend URL**. Open that link to see your live NeuroBank Guardian!
