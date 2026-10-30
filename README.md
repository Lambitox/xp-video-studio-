# XP Video Studio — complete front end + backend

This project replaces the old Pollinations image + canvas-recording approach with a real video-generation API call using Google's Gemini API and the `gemini-omni-1.1-flash` model.

## Project files

- `public/index.html` — Gemini-inspired front end, prompt box, progress state, player, MP4 download.
- `server.js` — Express backend. Keeps the Google API key on the server and calls the model.
- `package.json` — Node dependencies and start command.
- `.env.example` — environment variable names only; no secret key is included.

## Important before publishing

**Do not publish this as a single HTML file on a static-only site.** The backend must run on a Node.js host. Do not put your Google API key in the HTML or in any public repository.

## 1. Get a Google AI API key

1. Open Google AI Studio: https://aistudio.google.com/apikey
2. Create or select an API key.
3. Check that the Gemini API project has access to `gemini-omni-1.1-flash` and the required quota/billing setup.
4. Keep the key private. Do not send it in a chat or paste it into `public/index.html`.

The model and API availability can vary by account/region and can change over time. If this model is unavailable to your project, the backend returns a readable error; set `GEMINI_VIDEO_MODEL` to a video model your account actually supports.

## 2. Deploy the project

Recommended for this all-in-one project: deploy the whole folder to a Node.js hosting service that supports a long-running web process, such as Render or Google Cloud Run.

### Render (beginner-friendly path)

1. Download and unzip `xp-video-studio.zip` on a computer.
2. Put the unzipped project into a new private GitHub repository. Do not add a `.env` file or API key to GitHub.
3. In Render, create a **Web Service** and connect that repository.
4. Set:
   - **Runtime:** Node
   - **Build command:** `npm install`
   - **Start command:** `npm start`
5. In the service's **Environment** settings, add:
   - `GEMINI_API_KEY` = your private Google AI API key
   - `GEMINI_VIDEO_MODEL` = `gemini-omni-1.1-flash`
6. Deploy the service, then open its public URL.

Video generation can take a while. Some hosting plans/proxies have request time limits; if the host times out long requests, deploy on a platform with a suitable request timeout or change the architecture to asynchronous jobs. Do not assume that a successful website deployment means the Google model is enabled for your account.

## 3. Test the backend

Open `https://YOUR-SITE/api/health` (replace `YOUR-SITE` with your deployed domain). It should return JSON with `"ok": true` and `"apiKeyConfigured": true`.

If `apiKeyConfigured` is false, set the environment variable and redeploy/restart.

Then open the main site, enter a detailed prompt and press the arrow button. When successful, the app displays a real generated MP4 video and provides a download button.

## 4. Local test (optional)

Requires Node.js 20 or newer.

```bash
npm install
```

Set `GEMINI_API_KEY` in your terminal environment before starting. For example, on macOS/Linux:

```bash
export GEMINI_API_KEY="YOUR_KEY"
npm start
```

On Windows PowerShell:

```powershell
$env:GEMINI_API_KEY="YOUR_KEY"
npm start
```

Open `http://localhost:3000`.

## Common errors

- **Authentication / permission:** check the API key and model access.
- **Quota / rate limit:** check your Google AI quota and billing/plan.
- **Model unavailable:** confirm the model ID available to your account; set `GEMINI_VIDEO_MODEL` accordingly.
- **Backend not configured:** add `GEMINI_API_KEY` to host environment variables, not to the HTML.
- **Request timed out:** generation can take minutes. Use a host with a sufficiently long request timeout or implement a persistent asynchronous job queue.
- **No video returned:** inspect server logs and check the current official Gemini video-generation documentation.

## Official documentation

- Gemini Omni video generation: https://ai.google.dev/gemini-api/docs/omni
- Gemini API key setup: https://aistudio.google.com/apikey
