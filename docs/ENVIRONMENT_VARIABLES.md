# Environment Variables for WhatsApp Webhook

## 📋 Required Environment Variables

The following environment variables must be set in your Render.com deployment for the webhook to function properly.

### 🔧 Basic Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port (auto-set by Render) | `10000` | ✅ |
| `VERIFY_TOKEN` | WhatsApp webhook verification token | `your_verify_token_here` | ✅ |

### 📱 WhatsApp Business API

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `WHATSAPP_PHONE_NUMBER_ID` | Your WhatsApp phone number ID | `839070985945286` | ✅ |
| `WHATSAPP_ACCESS_TOKEN` | Your WhatsApp access token | `EAFXZBjU3Hme8BPasiHzJZB9GeSuXhcJwkft6ZCQ9gruYDYh9ZArQXyL5gI3pynZCqtvD5TdaVXBjrovDrAx90qhN4gR5W0N9TtaBHorXQDjhNx7TxPtOVZAiuCuqPRK7NJkYx3YjjiNfCor739UGSypJAYZBv7V0eQxUE1VGnufXftgiKYXn5dnS1yVVu8fkzZAn2ht6MzunlYSbHqHsOLlaz8oBEdHfnnsxVVVZCTN5VzJZCMzRTqIq4d2YChKCxHWQZDZD` | ✅ |

### 🤖 OpenAI API

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | `sk-...` | ✅ |

### 📊 Google Sheets API

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `GOOGLE_SHEETS_SPREADSHEET_ID` | Your Google Sheets spreadsheet ID | `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms` | ✅ |
| `GOOGLE_SHEETS_CREDENTIALS` | Google service account credentials (JSON) | `{"type": "service_account", ...}` | ✅ |

## 🚀 Setting Up Environment Variables on Render.com

### Step 1: Access Your Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your webhook service
3. Go to **Environment** tab

### Step 2: Add Environment Variables
1. Click **Add Environment Variable**
2. Add each variable from the table above
3. Click **Save Changes**

### Step 3: Redeploy
1. Go to **Manual Deploy** tab
2. Click **Deploy latest commit**

## 🔍 Verification Steps

### 1. Check Deployment Logs
After deployment, check the logs for:
```
WhatsApp Webhook server running on port 10000
Webhook URL: https://your-app-name.onrender.com
Verify Token: your_verify_token_here
```

### 2. Test Webhook Endpoint
Visit your webhook URL to see:
```
WhatsApp Webhook is running!
```

### 3. Verify WhatsApp Webhook
In Meta Developers Console:
1. Go to your WhatsApp Business API app
2. Navigate to **Webhooks**
3. Set webhook URL to: `https://your-app-name.onrender.com`
4. Set verify token to match your `VERIFY_TOKEN`
5. Subscribe to messages

## ⚠️ Common Issues

### Issue: "VERIFY_TOKEN is not defined"
**Solution**: Make sure `VERIFY_TOKEN` is set in Render environment variables

### Issue: "WHATSAPP_ACCESS_TOKEN is not defined"
**Solution**: Verify `WHATSAPP_ACCESS_TOKEN` is correctly set

### Issue: "OPENAI_API_KEY is not defined"
**Solution**: Ensure `OPENAI_API_KEY` is set and valid

### Issue: "GOOGLE_SHEETS_SPREADSHEET_ID is not defined"
**Solution**: Check that `GOOGLE_SHEETS_SPREADSHEET_ID` is set

## 🔐 Security Notes

- **Never commit environment variables** to your repository
- **Use strong, unique tokens** for production
- **Rotate tokens regularly** for security
- **Monitor API usage** to avoid rate limits

## 📞 Troubleshooting

### Deployment Fails
1. Check all required variables are set
2. Verify variable names match exactly
3. Ensure no extra spaces in values
4. Check Render logs for specific errors

### Webhook Not Responding
1. Verify webhook URL is correct
2. Check WhatsApp webhook configuration
3. Ensure verify token matches
4. Test webhook endpoint manually

### API Errors
1. Verify API keys are valid
2. Check API quotas and limits
3. Ensure proper permissions
4. Review API documentation

## 📚 Related Documentation

- [Render Environment Variables](https://render.com/docs/environment-variables)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [OpenAI API](https://platform.openai.com/docs)
- [Google Sheets API](https://developers.google.com/sheets/api)

---

**Last Updated**: 2025-08-30
**Version**: 1.0
