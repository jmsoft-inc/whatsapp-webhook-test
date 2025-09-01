/**
 * Image Storage Module
 * Handles saving and retrieving receipt images by invoice number
 */

const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Create storage directory if it doesn't exist
const STORAGE_DIR = path.join(__dirname, "receipt_images");
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

/**
 * Download and save image from WhatsApp media URL
 */
async function saveReceiptImage(mediaUrl, invoiceNumber) {
  try {
    console.log(`📸 Downloading image for invoice ${invoiceNumber}...`);
    console.log(`📸 Media URL: ${mediaUrl}`);

    // Check if this is a fallback URL (for testing)
    if (mediaUrl.includes("example.com")) {
      console.log(
        `⚠️ Using fallback URL - skipping image download for testing`
      );
      return {
        success: false,
        error: "Fallback URL - no real image to download",
      };
    }

    // Download image from WhatsApp
    const response = await axios.get(mediaUrl, {
      responseType: "arraybuffer",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      },
    });

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${invoiceNumber}_${timestamp}.jpg`;
    const filepath = path.join(STORAGE_DIR, filename);

    // Save image to file
    fs.writeFileSync(filepath, response.data);

    console.log(`✅ Image saved: ${filepath}`);

    return {
      success: true,
      filename: filename,
      filepath: filepath,
      size: response.data.length,
    };
  } catch (error) {
    console.error(
      `❌ Error saving image for invoice ${invoiceNumber}:`,
      error.message
    );
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get image info for an invoice number
 */
function getReceiptImageInfo(invoiceNumber) {
  try {
    const files = fs.readdirSync(STORAGE_DIR);
    const imageFile = files.find((file) => file.startsWith(invoiceNumber));

    if (imageFile) {
      const filepath = path.join(STORAGE_DIR, imageFile);
      const stats = fs.statSync(filepath);

      return {
        exists: true,
        filename: imageFile,
        filepath: filepath,
        size: stats.size,
        created: stats.birthtime,
      };
    }

    return { exists: false };
  } catch (error) {
    console.error(
      `❌ Error getting image info for invoice ${invoiceNumber}:`,
      error.message
    );
    return { exists: false, error: error.message };
  }
}

/**
 * Create a simple HTML viewer for receipt images
 */
function createReceiptViewer(invoiceNumber) {
  const imageInfo = getReceiptImageInfo(invoiceNumber);

  if (!imageInfo.exists) {
    return `
      <html>
        <head><title>Receipt ${invoiceNumber}</title></head>
        <body>
          <h1>Receipt ${invoiceNumber}</h1>
          <p>❌ Image not found</p>
        </body>
      </html>
    `;
  }

  const imageUrl = `/receipt_images/${imageInfo.filename}`;

  return `
    <html>
      <head>
        <title>Receipt ${invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .receipt-container { max-width: 800px; margin: 0 auto; }
          .receipt-image { max-width: 100%; height: auto; border: 1px solid #ccc; }
          .receipt-info { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <h1>🧾 Receipt ${invoiceNumber}</h1>
          
          <div class="receipt-info">
            <p><strong>Filename:</strong> ${imageInfo.filename}</p>
            <p><strong>Size:</strong> ${(imageInfo.size / 1024).toFixed(
              2
            )} KB</p>
            <p><strong>Created:</strong> ${imageInfo.created.toLocaleString()}</p>
          </div>
          
          <img src="${imageUrl}" alt="Receipt ${invoiceNumber}" class="receipt-image">
          
          <p><a href="/receipts">← Back to receipts list</a></p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Get list of all stored receipts
 */
function getAllReceipts() {
  try {
    const files = fs.readdirSync(STORAGE_DIR);
    const receipts = files
      .filter((file) => file.endsWith(".jpg"))
      .map((file) => {
        const filepath = path.join(STORAGE_DIR, file);
        const stats = fs.statSync(filepath);
        const invoiceNumber = file.split("_")[0];

        return {
          invoiceNumber: invoiceNumber,
          filename: file,
          size: stats.size,
          created: stats.birthtime,
        };
      })
      .sort((a, b) => b.created - a.created); // Newest first

    return receipts;
  } catch (error) {
    console.error("❌ Error getting receipts list:", error.message);
    return [];
  }
}

/**
 * Create HTML list of all receipts
 */
function createReceiptsList() {
  const receipts = getAllReceipts();

  const receiptsList = receipts
    .map(
      (receipt) => `
    <tr>
      <td><a href="/receipt/${receipt.invoiceNumber}">${
        receipt.invoiceNumber
      }</a></td>
      <td>${receipt.created.toLocaleDateString()}</td>
      <td>${receipt.created.toLocaleTimeString()}</td>
      <td>${(receipt.size / 1024).toFixed(2)} KB</td>
    </tr>
  `
    )
    .join("");

  return `
    <html>
      <head>
        <title>Receipts List</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .container { max-width: 1000px; margin: 0 auto; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f2f2f2; font-weight: bold; }
          a { color: #0066cc; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📋 Receipts List</h1>
          <p>Total receipts: ${receipts.length}</p>
          
          <table>
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Date</th>
                <th>Time</th>
                <th>Size</th>
              </tr>
            </thead>
            <tbody>
              ${receiptsList}
            </tbody>
          </table>
        </div>
      </body>
    </html>
  `;
}

module.exports = {
  saveReceiptImage,
  getReceiptImageInfo,
  createReceiptViewer,
  createReceiptsList,
  getAllReceipts,
  STORAGE_DIR,
};
