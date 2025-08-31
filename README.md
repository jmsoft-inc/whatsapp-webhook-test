# WhatsApp Webhook Test App

Een volledige webhook app voor WhatsApp Business API die bonnetjes en facturen automatisch verwerkt volgens de [officiële documentatie](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-whatsapp-echo-bot).

## 🚀 Features

- **📱 WhatsApp Integration** - Ontvangt berichten en foto's
- **🔍 OCR Processing** - Extraheert tekst uit afbeeldingen
- **🤖 AI Processing** - Verwerkt bonnetje data met OpenAI
- **📊 Google Sheets** - Slaat data op in spreadsheet
- **📤 Auto Response** - Stuurt samenvatting terug met sheet link

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
  - `WHATSAPP_PHONE_NUMBER_ID`: `839070985945286`
  - `WHATSAPP_ACCESS_TOKEN`: `EAFXZBjU3Hme8BPasiHzJZB9GeSuXhcJwkft6ZCQ9gruYDYh9ZArQXyL5gI3pynZCqtvD5TdaVXBjrovDrAx90qhN4gR5W0N9TtaBHorXQDjhNx7TxPtOVZAiuCuqPRK7NJkYx3YjjiNfCor739UGSypJAYZBv7V0eQxUE1VGnufXftgiKYXn5dnS1yVVu8fkzZAn2ht6MzunlYSbHqHsOLlaz8oBEdHfnnsxVVVZCTN5VzJZCMzRTqIq4d2YChKCxHWQZDZD`
  - `OPENAI_API_KEY`: `your-openai-api-key`
  - `GOOGLE_SHEETS_SPREADSHEET_ID`: `1w5xXCIvW99tq_EkeUj1id7z6z_lJkLeXCMY6WNm0rrg`

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
