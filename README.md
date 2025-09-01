# WhatsApp Webhook - Render Deployment

Georganiseerde WhatsApp webhook voor Render deployment met alle AI functionaliteit.

## 🏗️ **Project Structuur**

```
webhook/
├── 📁 app.js                           # Hoofdbestand - Start alles op
├── 📁 package.json                     # Dependencies
├── 📁 services/                        # Alle service modules
│   ├── 📁 ai_services/                 # AI en invoice analyse
│   │   ├── invoice_analysis_library.js
│   │   ├── improved_invoice_processing.js
│   │   └── professional_invoice_processing.js
│   ├── 📁 whatsapp_services/           # WhatsApp API communicatie
│   │   └── whatsapp_messaging.js
│   ├── 📁 sheets_services/             # Google Sheets integratie
│   │   └── comprehensive_sheets_service.js
│   ├── 📁 file_services/               # Bestand verwerking
│   │   ├── file_processor.js
│   │   └── image_storage.js
│   └── 📁 admin_services/              # Admin functionaliteit
│       ├── admin_commands.js
│       ├── performance_monitoring.js
│       └── version_management.js
├── 📁 utils/                           # Utility functies
│   ├── enhanced_error_handling.js
│   └── user_feedback.js
├── 📁 config/                          # Configuratie bestanden
└── 📁 core/                            # Core functionaliteit
```

## 🚀 **Hoe het Werkt**

### **1. app.js - Hoofdbestand**
- **Start de Express server**
- **Importeert alle services** uit georganiseerde folders
- **Verwerkt WhatsApp webhooks**
- **Routeert berichten** naar juiste services

### **2. Service Organisatie**
- **AI Services** → Invoice analyse en AI verwerking
- **WhatsApp Services** → Bericht verzending en ontvangst
- **Sheets Services** → Google Sheets integratie
- **File Services** → Bestand verwerking en opslag
- **Admin Services** → Beheer en monitoring

### **3. Render Deployment**
- **Automatische deployment** vanuit GitHub
- **Alle services beschikbaar** in georganiseerde structuur
- **Volledige functionaliteit** zonder externe dependencies

## 📱 **Endpoints**

- **`GET /`** - Health check
- **`GET /health`** - Status met alle services
- **`POST /webhook`** - WhatsApp webhook verwerking

## 🔧 **Environment Variables**

Maak `.env` bestand in `config/credentials/`:
```env
# WhatsApp API
WHATSAPP_ACCESS_TOKEN=your_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_id

# OpenAI
OPENAI_API_KEY=your_openai_key

# Google Sheets
GOOGLE_SHEETS_CREDENTIALS=your_credentials
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
```

## 📊 **Features**

- 🤖 **AI-Powered Invoice Analysis** - ChatGPT-4o-mini
- 📱 **WhatsApp Business API** - Volledige bericht verwerking
- 📊 **Google Sheets Integration** - Automatische data opslag
- 🔍 **OCR Processing** - Tekst extractie uit afbeeldingen/PDFs
- 📁 **File Management** - Document verwerking en opslag
- 🔧 **Admin Commands** - Beheer en monitoring

## 🔄 **Development**

1. **Wijzigingen maken** in main project (`ai.agents.jmsoft`)
2. **Services kopiëren** naar webhook/services/
3. **app.js bijwerken** met nieuwe imports
4. **Commit en push** naar GitHub
5. **Automatische deployment** op Render

## 📚 **Service Details**

### **AI Services**
- `invoice_analysis_library.js` - Hoofdanalyse van facturen
- `improved_invoice_processing.js` - Verbeterde verwerking
- `professional_invoice_processing.js` - Professionele verwerking

### **WhatsApp Services**
- `whatsapp_messaging.js` - API communicatie en berichten

### **Sheets Services**
- `comprehensive_sheets_service.js` - Google Sheets integratie

### **File Services**
- `file_processor.js` - Bestand verwerking
- `image_storage.js` - Afbeelding opslag

### **Admin Services**
- `admin_commands.js` - Admin commando's
- `performance_monitoring.js` - Performance monitoring
- `version_management.js` - Versie beheer

---

**JMSoft AI Agents** - Intelligent invoice processing made simple! 🎯
