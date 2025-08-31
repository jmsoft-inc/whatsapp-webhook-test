# WhatsApp Webhook Setup Guide

## 🚨 PROBLEEM GEVONDEN

**Het probleem:** Environment variables zijn niet ingesteld in Render.com, waardoor de WhatsApp API niet werkt.

## 🔧 STAP-VOOR-STAP OPLOSSING

### **Stap 1: Ga naar Render.com Dashboard**
1. Bezoek [https://dashboard.render.com](https://dashboard.render.com)
2. Log in met je account
3. Selecteer je webhook service: `whatsapp-webhook-test-hvcc`

### **Stap 2: Voeg Environment Variables Toe**
1. Klik op je webhook service
2. Ga naar de **"Environment"** tab
3. Klik **"Add Environment Variable"**
4. Voeg de volgende variables toe:

#### **🔧 Basic Configuration:**
```
VERIFY_TOKEN = ai-agents-verify-jmsoft-123
```

#### **📱 WhatsApp Business API:**
```
WHATSAPP_PHONE_NUMBER_ID = 839070985945286
WHATSAPP_ACCESS_TOKEN = EAFXZBjU3Hme8BPasiHzJZB9GeSuXhcJwkft6ZCQ9gruYDYh9ZArQXyL5gI3pynZCqtvD5TdaVXBjrovDrAx90qhN4gR5W0N9TtaBHorXQDjhNx7TxPtOVZAiuCuqPRK7NJkYx3YjjiNfCor739UGSypJAYZBv7V0eQxUE1VGnufXftgiKYXn5dnS1yVVu8fkzZAn2ht6MzunlYSbHqHsOLlaz8oBEdHfnnsxVVVZCTN5VzJZCMzRTqIq4d2YChKCxHWQZDZD
```

#### **🤖 OpenAI API:**
```
OPENAI_API_KEY = [JOUW_OPENAI_API_KEY]
```

#### **📊 Google Sheets API:**
```
GOOGLE_SHEETS_SPREADSHEET_ID = [JOUW_SPREADSHEET_ID]
GOOGLE_SHEETS_CREDENTIALS = [JOUW_GOOGLE_CREDENTIALS_JSON]
```

### **Stap 3: Save en Redeploy**
1. Klik **"Save Changes"**
2. Ga naar **"Manual Deploy"** tab
3. Klik **"Deploy latest commit"**
4. Wacht tot deployment voltooid is (2-3 minuten)

### **Stap 4: Test de Webhook**
1. Ga naar **"Logs"** tab
2. Zoek naar deze succesvolle logs:
```
WhatsApp Webhook server running on port 10000
Webhook URL: https://whatsapp-webhook-test-hvcc.onrender.com
Verify Token: ai-agents-verify-jmsoft-123
```

### **Stap 5: Test WhatsApp Bericht**
1. Stuur "test" naar je WhatsApp nummer
2. Je zou nu een interactive menu moeten ontvangen
3. Check de logs voor processing informatie

## 🔍 VERIFICATIE

### **✅ Succesvolle Setup:**
- ✅ Environment variables ingesteld
- ✅ Deployment voltooid
- ✅ Webhook start zonder errors
- ✅ WhatsApp berichten worden verwerkt
- ✅ Interactive menu wordt teruggestuurd

### **❌ Mogelijke Problemen:**
- ❌ Environment variables niet correct ingesteld
- ❌ WhatsApp access token expired
- ❌ Phone number niet geactiveerd
- ❌ Webhook URL niet geconfigureerd

## 📞 TROUBLESHOOTING

### **Probleem: "WHATSAPP_ACCESS_TOKEN is not defined"**
**Oplossing:** Voeg de ACCESS_TOKEN toe in Render environment variables

### **Probleem: "Error sending WhatsApp message"**
**Oplossing:** 
1. Check of ACCESS_TOKEN correct is
2. Verificeer phone number permissions
3. Regenerate access token indien nodig

### **Probleem: "Phone number not active"**
**Oplossing:**
1. Ga naar Meta Developers Console
2. Check phone number status
3. Activeer phone number indien nodig

## 🎯 VOLGENDE STAPPEN

Na het instellen van de environment variables:

1. **Test de webhook** met een bericht
2. **Controleer de logs** voor processing
3. **Verificeer WhatsApp response** op je telefoon
4. **Test alle menu opties** voor volledige functionaliteit

## 📚 HULPBRONNEN

- [Render Environment Variables](https://render.com/docs/environment-variables)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Meta Developers Console](https://developers.facebook.com)

---

**Laat me weten als je de environment variables hebt ingesteld, dan kunnen we de test opnieuw uitvoeren!** 🚀
