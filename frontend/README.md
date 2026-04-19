# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## 🚀 How to Deploy the Full Project for Free

Here is a step-by-step guide to deploying your full-stack (React + Node.js + MongoDB) application completely for free.

### 1. Database Setup (MongoDB Atlas Free Tier)
1. Sign up for [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a new project.
2. Build a **Free Cluster (M0 Sandbox)**.
3. Under **Database Access**, create a new Database User with a secure username and password.
4. Under **Network Access**, click "Add IP Address" and choose **"Allow Access from Anywhere"** (`0.0.0.0/0`).
5. Go to Databases, click **"Connect"** -> **"Drivers"**, and copy the connection string. Replace `<password>` with your database user password.

### 2. Backend Deployment (Render.com Free Tier)
1. Push your full project scope to a **GitHub repository**.
2. Sign up for a free account at [Render](https://render.com/).
3. Click **"New"** -> **"Web Service"**.
4. Connect your GitHub account and select your project repository.
5. In the configuration:
   - **Root Directory:** `backend` (Since your backend is inside the `backend` folder).
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start` *(or `node index.js` / `node server.js` depending on your package.json start script)*.
   - **Instance Type:** Select the **Free** tier.
6. Scroll down to **Environment Variables** and add all necessary variables from your `backend/.env` file:
   - `MONGO_URI`: `your_mongodb_connection_string` (from Step 1)
   - `GEMINI_API_KEY`: `your_gemini_api_key`
   - `PORT`: `5000`
7. Click **"Create Web Service"**. Render will install dependencies and deploy the server. 
8. 🔗 **Copy your new Backend URL** (e.g., `https://your-app-backend.onrender.com`).

### 3. Frontend Deployment (Vercel Free Tier)
1. Before deploying, you must ensure your frontend points to the production backend. Update your API base URL in the frontend code. Replace any `http://localhost:5000` references with your new **Render Backend URL**.
   - *Best Practice:* Use an environment variable like `VITE_API_URL` and reference it using `import.meta.env.VITE_API_URL` in your API calls.
2. Commit and push these URL changes to your **GitHub repository**.
3. Sign up for a free account at [Vercel](https://vercel.com/signup).
4. Click **"Add New..."** -> **"Project"**.
5. Import your GitHub repository.
6. In the project configuration:
   - **Root Directory:** Edit this and select the `frontend` folder.
   - **Framework Preset:** `Vite` should be auto-detected.
7. Expand **Environment Variables** and add your backend Render URL as `VITE_API_URL` (if configured that way).
8. Click **"Deploy"**. Vercel will automatically build and publish your React app.
9. 🔗 **Visit your live Vercel URL** (e.g., `https://your-app-frontend.vercel.app`) to see your deployed Career Navigator application!

🎉 **Congratulations! Your full-stack project is now live on the internet!**
