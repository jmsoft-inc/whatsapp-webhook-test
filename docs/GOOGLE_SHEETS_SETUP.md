# Google Sheets Setup Guide for Render.com

## 🚨 Current Issue
The webhook is working but data is not being saved to Google Sheets because `GOOGLE_SHEETS_CREDENTIALS` is not properly set on Render.com.

## 📋 Step-by-Step Solution

### Step 1: Get Your Google Service Account Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project (or create one if needed)

2. **Enable Google Sheets API**
   - Go to **APIs & Services** > **Library**
   - Search for "Google Sheets API"
   - Click **Enable**

3. **Create Service Account**
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **Service Account**
   - Fill in:
     - Service account name: `whatsapp-webhook`
     - Service account description: `Service account for WhatsApp webhook`
   - Click **Create and Continue**

4. **Grant Permissions**
   - Role: **Editor** (or **Viewer** if you only need read access)
   - Click **Continue**
   - Click **Done**

5. **Create and Download Key**
   - Click on your new service account
   - Go to **Keys** tab
   - Click **Add Key** > **Create new key**
   - Choose **JSON** format
   - Click **Create**
   - **Save the downloaded JSON file**

### Step 2: Set Up Google Sheet

1. **Create or Open Your Google Sheet**
   - Go to: https://sheets.google.com
   - Create a new sheet or open existing one

2. **Share with Service Account**
   - Click **Share** button
   - Add your service account email (from the JSON file)
   - Give **Editor** permissions
   - Click **Send**

3. **Get Spreadsheet ID**
   - From the URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Copy the `SPREADSHEET_ID` part

### Step 3: Configure Render.com Environment Variables

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Select your webhook service

2. **Add Environment Variables**
   - Go to **Environment** tab
   - Add these variables:

   **Variable**: `GOOGLE_SHEETS_SPREADSHEET_ID`
   **Value**: Your spreadsheet ID (e.g., `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`)

   **Variable**: `GOOGLE_SHEETS_CREDENTIALS`
   **Value**: The entire JSON content from your downloaded service account file

3. **Important**: For `GOOGLE_SHEETS_CREDENTIALS`
   - Copy the **entire JSON content** from your downloaded file
   - Paste it as a **single line** (no line breaks)
   - Example format:
   ```
   {"type":"service_account","project_id":"your-project","private_key_id":"abc123","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n","client_email":"whatsapp-webhook@your-project.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/whatsapp-webhook%40your-project.iam.gserviceaccount.com"}
   ```

### Step 4: Redeploy Your Service

1. **Go to Manual Deploy**
   - Click **Manual Deploy** tab
   - Click **Deploy latest commit**

2. **Wait for Deployment**
   - Monitor the deployment logs
   - Look for successful startup message

### Step 5: Test the Integration

1. **Send a test message via WhatsApp**
   - Send "test" to your WhatsApp number
   - You should see the menu

2. **Choose option 1 or 2**
   - Send a photo of a receipt/invoice
   - Check if data appears in your Google Sheet

3. **Check Render Logs**
   - Look for successful Google Sheets save messages:
   ```
   ✅ Successfully saved to Google Sheets
   ```

## 🔍 Troubleshooting

### Issue: "Missing Google Sheets environment variables"
**Solution**: Make sure both `GOOGLE_SHEETS_SPREADSHEET_ID` and `GOOGLE_SHEETS_CREDENTIALS` are set

### Issue: "GOOGLE_SHEETS_CREDENTIALS: false"
**Solution**: The JSON credentials are not properly formatted. Make sure:
- No line breaks in the JSON
- All quotes are properly escaped
- The JSON is valid

### Issue: "Permission denied"
**Solution**: 
- Make sure the service account email has access to the Google Sheet
- Check that the Google Sheets API is enabled
- Verify the service account has the correct permissions

### Issue: "Spreadsheet not found"
**Solution**: 
- Verify the spreadsheet ID is correct
- Make sure the spreadsheet is shared with the service account email
- Check that the spreadsheet exists and is accessible

## 📞 Need Help?

If you're still having issues:

1. **Check Render Logs**: Look for specific error messages
2. **Verify JSON Format**: Use a JSON validator to check your credentials
3. **Test Locally**: Use the `test_google_sheets_integration.js` script to test locally

## 🔐 Security Reminder

- Never commit the service account JSON file to your repository
- Keep your service account credentials secure
- Consider using environment-specific service accounts for production

---

**Last Updated**: 2025-08-30
**Status**: Active Issue Resolution
