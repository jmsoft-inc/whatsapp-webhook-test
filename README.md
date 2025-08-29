# WhatsApp Webhook Test App

Een test webhook app voor WhatsApp Business API volgens de [officiële documentatie](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-whatsapp-echo-bot).

## 🚀 Deployment op Render.com

### Stap 1: GitHub Repository
1. Maak een nieuwe GitHub repository aan
2. Upload deze bestanden naar de repository
3. Zorg dat de repository public is

### Stap 2: Render.com Setup
1. Ga naar [Render.com](https://render.com)
2. Maak een account aan of log in
3. Klik op "New" → "Web Service"
4. Verbind je GitHub repository

### Stap 3: Render Configuratie
- **Name:** `whatsapp-webhook-test`
- **Build Command:** `npm install`
- **Start Command:** `node app.js`
- **Environment Variables:**
  - `VERIFY_TOKEN`: `ai-agents-verify-jmsoft-123`

### Stap 4: Deploy
1. Klik op "Create Web Service"
2. Wacht tot deployment klaar is
3. Kopieer de URL (bijv. `https://whatsapp-webhook-test.onrender.com`)

## 🔧 WhatsApp Webhook Configuratie

### Stap 5: Meta App Dashboard
1. Ga naar je Meta Developer App
2. WhatsApp → Webhooks → Configuration
3. **Callback URL:** `https://your-app-name.onrender.com`
4. **Verify Token:** `ai-agents-verify-jmsoft-123`
5. Klik "Verify and save"

### Stap 6: Webhook Fields
- Subscribe to **messages** field
- Klik op "Test" om een test bericht te sturen

## 📊 Monitoring

- Bekijk de logs in Render dashboard
- Je ziet "WEBHOOK VERIFIED" bij succesvolle verificatie
- Test berichten verschijnen in de logs

## 🔍 Troubleshooting

- Zorg dat de repository public is
- Controleer of VERIFY_TOKEN overeenkomt
- Bekijk Render logs voor errors
- Test webhook werkt in Development en Live mode

## 📝 Files

- `app.js` - Express webhook server
- `package.json` - Dependencies
- `README.md` - Deze instructies
