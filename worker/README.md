# Reserve service (Cloudflare Worker + D1)

Gives the barcode app **global** no-repeat guarantees: the app POSTs each candidate
code here, and D1's `PRIMARY KEY` on `code` reserves it atomically or rejects a duplicate.

You only need the **dashboard** — no CLI, no credit card. ~5 minutes.

## One-time setup

1. **Sign up / log in** at https://dash.cloudflare.com (free plan is fine).

2. **Create the database.** Left sidebar → **Storage & Databases → D1** → **Create database**.
   - Name it `pos_barcode` → Create.
   - Open it → **Console** tab → paste the contents of [`schema.sql`](schema.sql) → **Execute**.
     (You should see the `issued_codes` table appear under **Tables**.)

3. **Create the Worker.** Sidebar → **Workers & Pages → Create → Workers → Create Worker**.
   - Give it a name, e.g. `pos-barcode-reserve` → **Deploy** (accept the default code for now).
   - This gives you a URL like `https://pos-barcode-reserve.<your-subdomain>.workers.dev`.

4. **Paste the code.** On the Worker → **Edit code** → select all, delete, and paste the
   contents of [`worker.js`](worker.js) → **Deploy**.

5. **Bind the database.** Worker → **Settings → Bindings → Add → D1 database**.
   - Variable name: `DB`  (exactly this)
   - D1 database: `pos_barcode`
   - Save, then **Deploy** once more so the binding takes effect.

## Verify

Open `https://<your-worker-url>/count` in a browser — it should return:

```json
{ "count": 0 }
```

## Then send me the Worker URL

Paste me `https://pos-barcode-reserve.<your-subdomain>.workers.dev` and I'll wire the live
site to it and push. From then on, every code is reserved globally and can never repeat for
anyone.

---

### Notes
- CORS is open (`*`) and the endpoint only inserts codes (no way to read the list back), so
  it's safe to call from the public site. If you later want to lock it down, restrict
  `Access-Control-Allow-Origin` to `https://fskt865.github.io` in `worker.js`.
- Free D1 limits (millions of rows / reads per day) are far beyond this tool's needs.
