const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");

// Import the professional invoice processing
const {
  createProfessionalInvoiceResponse,
  isProfessionalInvoice,
  isReceipt,
} = require("./services/professional_invoice_processing");

async function testRomslompProcessing() {
  try {
    console.log("🧪 Testing Romslomp Invoice Processing...\n");

    // Extract text from PDF
    const pdfPath = path.join(
      __dirname,
      "../tests/bonnentjes/factuur rompslomp.pdf"
    );
    const dataBuffer = fs.readFileSync(pdfPath);

    const data = await pdfParse(dataBuffer);
    const extractedText = data.text;

    console.log("📄 Extracted text from Romslomp PDF:");
    console.log("=".repeat(80));
    console.log(extractedText);
    console.log("=".repeat(80));

    // Test document type detection
    console.log("\n🔍 Testing Document Type Detection:");
    console.log("=".repeat(50));

    const isProfInvoice = isProfessionalInvoice(extractedText);
    const isReceiptDoc = isReceipt(extractedText);

    console.log(
      `📄 Is Professional Invoice: ${isProfInvoice ? "✅ YES" : "❌ NO"}`
    );
    console.log(`🧾 Is Receipt: ${isReceiptDoc ? "✅ YES" : "❌ NO"}`);

    if (isProfInvoice) {
      console.log("✅ Correctly identified as professional invoice!");
    } else {
      console.log("❌ Failed to identify as professional invoice");
    }

    // Test professional invoice processing
    console.log("\n📄 Testing Professional Invoice Processing:");
    console.log("=".repeat(50));

    const invoiceNumber = "TEST-ROMSLOMP-001";
    const result = createProfessionalInvoiceResponse(
      extractedText,
      invoiceNumber
    );

    console.log("\n📊 EXTRACTION RESULTS:");
    console.log("=====================");
    console.log(`Invoice Number: ${result.invoice_number}`);
    console.log(`Company Name: ${result.company_name}`);
    console.log(`Supplier Name: ${result.supplier_name}`);
    console.log(`Supplier Address: ${result.supplier_address}`);
    console.log(`Supplier Phone: ${result.supplier_phone}`);
    console.log(`Supplier Email: ${result.supplier_email}`);
    console.log(`Supplier Website: ${result.supplier_website}`);
    console.log(`Supplier BTW: ${result.supplier_btw}`);
    console.log(`Supplier KVK: ${result.supplier_kvk}`);
    console.log(`Supplier IBAN: ${result.supplier_iban}`);
    console.log(`Supplier BIC: ${result.supplier_bic}`);
    console.log(`Invoice Date: ${result.invoice_date}`);
    console.log(`Due Date: ${result.due_date}`);
    console.log(`Invoice Reference: ${result.invoice_reference}`);
    console.log(`Customer Name: ${result.customer_name}`);
    console.log(`Customer Address: ${result.customer_address}`);
    console.log(`Subtotal excl BTW: ${result.subtotal_excl_btw}`);
    console.log(`BTW Amount: ${result.btw_amount}`);
    console.log(`BTW Percentage: ${result.btw_percentage}%`);
    console.log(`Total Amount: ${result.total_amount}`);
    console.log(`Currency: ${result.currency}`);
    console.log(`Payment Terms: ${result.payment_terms}`);
    console.log(`Items Count: ${result.items.length}`);
    console.log(`Document Type: ${result.document_type}`);
    console.log(`Processing Method: ${result.processing_method}`);

    if (result.items.length > 0) {
      console.log("\n📦 ITEMS:");
      console.log("=========");
      result.items.forEach((item, index) => {
        console.log(`Item ${index + 1}:`);
        console.log(`  Quantity: ${item.quantity}`);
        console.log(`  Description: ${item.description}`);
        console.log(`  Price excl BTW: €${item.price_excl_btw}`);
        console.log(`  Price incl BTW: €${item.price_incl_btw}`);
      });
    }

    // Define expected values based on the Romslomp invoice
    const expected = {
      company_name: "Meubelstoffeerderij Nicolaas",
      supplier_name: "Meubelstoffeerderij Nicolaas",
      supplier_address: "Hoog-Harnasch 24",
      supplier_phone: "+31 (0) 6 395 91370",
      supplier_email: "info@jmsoft.nl",
      supplier_website: "www.JMSoft.nl",
      supplier_btw: "NL002383926",
      supplier_kvk: "75064162",
      supplier_iban: "NL67 ABNA 0516 3161 92",
      supplier_bic: "ABNANL2A",
      invoice_date: "2025-03-13",
      due_date: "2025-04-12",
      invoice_reference: "2025030001",
      customer_name: "JMS Marketing",
      customer_address: "Praagsingel 155",
      subtotal_excl_btw: 247.93,
      btw_amount: 52.07,
      btw_percentage: 21,
      total_amount: 300.0,
      currency: "EUR",
      payment_terms: "€ 300,00 due 12/04/2025",
      items_count: 1,
    };

    console.log("\n🎯 EXPECTED VALUES:");
    console.log("==================");
    console.log(`Company Name: ${expected.company_name}`);
    console.log(`Supplier Name: ${expected.supplier_name}`);
    console.log(`Supplier Address: ${expected.supplier_address}`);
    console.log(`Supplier Phone: ${expected.supplier_phone}`);
    console.log(`Supplier Email: ${expected.supplier_email}`);
    console.log(`Supplier Website: ${expected.supplier_website}`);
    console.log(`Supplier BTW: ${expected.supplier_btw}`);
    console.log(`Supplier KVK: ${expected.supplier_kvk}`);
    console.log(`Supplier IBAN: ${expected.supplier_iban}`);
    console.log(`Supplier BIC: ${expected.supplier_bic}`);
    console.log(`Invoice Date: ${expected.invoice_date}`);
    console.log(`Due Date: ${expected.due_date}`);
    console.log(`Invoice Reference: ${expected.invoice_reference}`);
    console.log(`Customer Name: ${expected.customer_name}`);
    console.log(`Customer Address: ${expected.customer_address}`);
    console.log(`Subtotal excl BTW: ${expected.subtotal_excl_btw}`);
    console.log(`BTW Amount: ${expected.btw_amount}`);
    console.log(`BTW Percentage: ${expected.btw_percentage}%`);
    console.log(`Total Amount: ${expected.total_amount}`);
    console.log(`Currency: ${expected.currency}`);
    console.log(`Payment Terms: ${expected.payment_terms}`);
    console.log(`Items Count: ${expected.items_count}`);

    // Calculate accuracy
    const fields = [
      {
        name: "company_name",
        expected: expected.company_name,
        actual: result.company_name,
      },
      {
        name: "supplier_name",
        expected: expected.supplier_name,
        actual: result.supplier_name,
      },
      {
        name: "supplier_address",
        expected: expected.supplier_address,
        actual: result.supplier_address,
      },
      {
        name: "supplier_phone",
        expected: expected.supplier_phone,
        actual: result.supplier_phone,
      },
      {
        name: "supplier_email",
        expected: expected.supplier_email,
        actual: result.supplier_email,
      },
      {
        name: "supplier_website",
        expected: expected.supplier_website,
        actual: result.supplier_website,
      },
      {
        name: "supplier_btw",
        expected: expected.supplier_btw,
        actual: result.supplier_btw,
      },
      {
        name: "supplier_kvk",
        expected: expected.supplier_kvk,
        actual: result.supplier_kvk,
      },
      {
        name: "supplier_iban",
        expected: expected.supplier_iban,
        actual: result.supplier_iban,
      },
      {
        name: "supplier_bic",
        expected: expected.supplier_bic,
        actual: result.supplier_bic,
      },
      {
        name: "invoice_date",
        expected: expected.invoice_date,
        actual: result.invoice_date,
      },
      {
        name: "due_date",
        expected: expected.due_date,
        actual: result.due_date,
      },
      {
        name: "invoice_reference",
        expected: expected.invoice_reference,
        actual: result.invoice_reference,
      },
      {
        name: "customer_name",
        expected: expected.customer_name,
        actual: result.customer_name,
      },
      {
        name: "customer_address",
        expected: expected.customer_address,
        actual: result.customer_address,
      },
      {
        name: "subtotal_excl_btw",
        expected: expected.subtotal_excl_btw,
        actual: result.subtotal_excl_btw,
      },
      {
        name: "btw_amount",
        expected: expected.btw_amount,
        actual: result.btw_amount,
      },
      {
        name: "btw_percentage",
        expected: expected.btw_percentage,
        actual: result.btw_percentage,
      },
      {
        name: "total_amount",
        expected: expected.total_amount,
        actual: result.total_amount,
      },
      {
        name: "currency",
        expected: expected.currency,
        actual: result.currency,
      },
      {
        name: "payment_terms",
        expected: expected.payment_terms,
        actual: result.payment_terms,
      },
      {
        name: "items_count",
        expected: expected.items_count,
        actual: result.items.length,
      },
    ];

    let correct = 0;
    let total = 0;

    console.log("\n✅ ACCURACY CHECK:");
    console.log("==================");

    fields.forEach((field) => {
      total++;
      const isMatch = field.expected === field.actual;

      if (isMatch) {
        console.log(`✅ ${field.name}: ${field.actual}`);
        correct++;
      } else {
        console.log(
          `❌ ${field.name}: Expected "${field.expected}", Got "${field.actual}"`
        );
      }
    });

    console.log(
      `\n🎯 ACCURACY: ${correct}/${total} (${Math.round(
        (correct / total) * 100
      )}%)`
    );

    if (correct === total) {
      console.log("🎉 PERFECT EXTRACTION! All fields correctly extracted.");
    } else {
      console.log("⚠️ Some fields need improvement.");
    }

    return result;
  } catch (error) {
    console.error("❌ Error testing Romslomp processing:", error);
    throw error;
  }
}

// Run the test
testRomslompProcessing()
  .then(() => {
    console.log("\n🎉 Romslomp invoice processing test completed!");
  })
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
  });
