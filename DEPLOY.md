# Putting The Climb online (access from your phone, anywhere)

This hosts the app on **Render's free tier** so you get a URL like
`https://the-climb.onrender.com` that works on any device.

> **Read this first — about your data.** Render's free plan wipes the server's
> filesystem on every redeploy and after the app sleeps from inactivity. Because
> The Climb stores data in a JSON file, that means **your logged deals/activity
> can reset over time on the free plan.** Two ways to handle it:
> - **Fine for now:** use it free to check your dashboard on your phone; re-seed
>   or re-enter if it resets.
> - **Permanent:** upgrade the Render service to a paid plan ($7/mo) and turn on a
>   disk (steps at the bottom), *or* ask me to wire up a free hosted database
>   (Neon Postgres) so it never resets, even on free hosting.

---

## Step 1 — Put the code on GitHub
I've already initialized a git repo and made the first commit for you. You just need to push it.

1. Create a free account at https://github.com if you don't have one.
2. Make a new **empty** repo: https://github.com/new → name it `the-climb` → **Create repository** (don't add a README).
3. In a terminal in this folder, run the two commands GitHub shows you under
   *"…or push an existing repository"*. They look like:
   ```
   git remote add origin https://github.com/YOUR_USERNAME/the-climb.git
   git branch -M main
   git push -u origin main
   ```

## Step 2 — Deploy on Render
1. Sign up free at https://render.com (use "Sign in with GitHub" — easiest).
2. Click **New +** → **Blueprint**.
3. Pick your `the-climb` repo. Render reads `render.yaml` and fills everything in.
4. Click **Apply**. First build takes ~2–3 minutes.
5. When it's live, open the URL it gives you (e.g. `the-climb.onrender.com`) on your phone. Add it to your home screen for an app-like icon.

That's it. Every time you `git push`, Render auto-redeploys.

> Heads up: free services **sleep after ~15 min idle**, so the first load after a
> while takes ~30 seconds to wake up. Normal for the free tier.

---

## Optional — make data permanent (paid)
1. In Render, open the service → **Settings** → change the instance type to a paid plan.
2. Edit `render.yaml`: uncomment the `DATA_DIR` env var and the `disk:` block (already written for you), commit, and push.
3. Render mounts a permanent 1 GB disk at `/data` and the app stores everything there forever.
