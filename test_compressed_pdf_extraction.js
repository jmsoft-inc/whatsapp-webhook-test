const { createFallbackResponse } = require('./services/improved_invoice_processing.js');

console.log('🧪 Testing compressed PDF text extraction...\n');

// This is the actual extracted text from the PDF logs
const compressedText = `
ALBERT HEIJN FILIAAL 1427
Parijsplein 19
Telefoon 070-3935033
AANTALOMSCHRIJVINGPRIJSBEDRAG
BONUSKAARTxx0802
AIRMILES NR. *xx6254
1BOODSCH TAS1,59
1DZH HV MELK1,99
1DZH YOGHURT2,29
1HONING2,25
3BAPAO0,992,97
1DZH CREME FR1,09
1ZAANSE HOEVE2,6925%
1BOTERH WORST1,49
1SCHOUDERHAM1,79
1AH ROOMBRIE2,99
1CHERRYTOMAAT1,19
1AH SALADE3,29B
1AH SALADE2,79B
1VRUCHT HAGEL2,59
1ROZ KREN BOL2,69
2VOLK BOLLEN1,593,18
1DE ICE CARAM1,59
1APPELFLAP1,78B
21SUBTOTAAL40,24
BONUSAHROOMBOTERA-0,79
BONUSAHSALADES175-2,33
25% KZAANSE HOEVE-0,67
UW VOORDEEL3,79
Waarvan
BONUS BOX PREMIUM0,00
SUBTOTAAL36,45
74KOOPZEGELS PREMIUM7,40
TOTAAL43,85
SPAARACTIES:
6eSPAARZEGELS PREMIUM
28MIJN AH MILES PREMIUM
BETAALD MET:

PINNEN43,85
POI: 50282895
KLANTTICKETTerminal5F2GVM
Merchant1315641Periode5234
Transactie02286653Maestro
(A0000000043060)ABN AMRO BANK
Kaart673400xxxxxxxxx2056Kaartserienummer5
BETALINGDatum22/08/2025 12:55
AutorisatiecodeF30005Totaal43,85 EUR
ContactlessLeesmethode CHIP
BTWOVEREUR
9%31,982,88
21%1,310,28
TOTAAL33,293,16
14273541
12:5422-8-2025
Vragen over je kassabon?
Onze collega's helpen je
graag`;

console.log('📄 Compressed text length:', compressedText.length, 'characters\n');

const result = createFallbackResponse(compressedText, 'TEST_COMPRESSED_001');

console.log('\n=== EXTRACTION RESULTS ===');
console.log(`📅 Date: ${result.date}`);
console.log(`🕐 Time: ${result.time}`);
console.log(`💰 Subtotal before discount: ${result.subtotal_before_discount}`);
console.log(`💰 Subtotal after discount: ${result.subtotal}`);
console.log(`📊 BTW 9%: ${result.tax_9}`);
console.log(`📊 BTW 21%: ${result.tax_21}`);
console.log(`📊 BTW 9% Base: ${result.btw_breakdown.btw_9_base}`);
console.log(`📊 BTW 21% Base: ${result.btw_breakdown.btw_21_base}`);
console.log(`🎁 Bonus amount: ${result.bonus_amount}`);
console.log(`💎 Voordeel amount: ${result.voordeel_amount}`);
console.log(`🎫 Koopzegels amount: ${result.koopzegels_amount}`);
console.log(`🎫 Koopzegels count: ${result.koopzegels_count}`);
console.log(`💵 Total amount: ${result.total_amount}`);
console.log(`💳 Payment PIN: ${result.payment_pin}`);
console.log(`📦 Item count: ${result.item_count}`);
console.log(`🔄 Transactie: ${result.store_info.transactie}`);
console.log(`💻 Terminal: ${result.store_info.terminal}`);
console.log(`🏢 Merchant: ${result.store_info.merchant}`);
console.log(`🎯 Bonuskaart: ${result.loyalty.bonuskaart}`);
console.log(`✈️ Air Miles: ${result.loyalty.air_miles}`);
console.log(`🎯 Confidence: ${result.confidence}%`);

console.log('\n=== EXPECTED VALUES ===');
console.log('📅 Date: 2025-08-22');
console.log('🕐 Time: 12:55');
console.log('💰 Subtotal before discount: 40.24');
console.log('💰 Subtotal after discount: 36.45');
console.log('📊 BTW 9%: 2.88');
console.log('📊 BTW 21%: 0.28');
console.log('📊 BTW 9% Base: 31.98');
console.log('📊 BTW 21% Base: 1.31');
console.log('🎁 Bonus amount: 3.79');
console.log('💎 Voordeel amount: 3.79');
console.log('🎫 Koopzegels amount: 7.4');
console.log('🎫 Koopzegels count: 74');
console.log('💵 Total amount: 43.85');
console.log('💳 Payment PIN: 43.85');
console.log('📦 Item count: 21');
console.log('🔄 Transactie: 02286653');
console.log('💻 Terminal: 5F2GVM');
console.log('🏢 Merchant: 1315641');
console.log('🎯 Bonuskaart: xx0802');
console.log('✈️ Air Miles: xx6254');

console.log('\n=== VALIDATION ===');
const tests = [
  { field: "date", expected: "2025-08-22", actual: result.date },
  { field: "time", expected: "12:55", actual: result.time },
  { field: "subtotal_before_discount", expected: 40.24, actual: result.subtotal_before_discount },
  { field: "subtotal", expected: 36.45, actual: result.subtotal },
  { field: "tax_9", expected: 2.88, actual: result.tax_9 },
  { field: "tax_21", expected: 0.28, actual: result.tax_21 },
  { field: "btw_9_base", expected: 31.98, actual: result.btw_breakdown.btw_9_base },
  { field: "btw_21_base", expected: 1.31, actual: result.btw_breakdown.btw_21_base },
  { field: "bonus_amount", expected: 3.79, actual: result.bonus_amount },
  { field: "voordeel_amount", expected: 3.79, actual: result.voordeel_amount },
  { field: "koopzegels_amount", expected: 7.4, actual: result.koopzegels_amount },
  { field: "koopzegels_count", expected: 74, actual: result.koopzegels_count },
  { field: "total_amount", expected: 43.85, actual: result.total_amount },
  { field: "payment_pin", expected: 43.85, actual: result.payment_pin },
  { field: "item_count", expected: 21, actual: result.item_count },
  { field: "transactie", expected: "02286653", actual: result.store_info.transactie },
  { field: "terminal", expected: "5F2GVM", actual: result.store_info.terminal },
  { field: "merchant", expected: "1315641", actual: result.store_info.merchant },
  { field: "bonuskaart", expected: "xx0802", actual: result.loyalty.bonuskaart },
  { field: "air_miles", expected: "xx6254", actual: result.loyalty.air_miles }
];

let passedTests = 0;
let totalTests = tests.length;

for (const test of tests) {
  const isMatch = test.actual === test.expected;
  const status = isMatch ? "✅" : "❌";
  console.log(`${status} ${test.field}: Expected ${test.expected}, Got ${test.actual}`);
  if (isMatch) passedTests++;
}

console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
console.log(`${passedTests === totalTests ? "🎉" : "⚠️"} Overall Result: ${passedTests === totalTests ? "ALL TESTS PASSED" : "SOME TESTS FAILED"}`);

if (passedTests === totalTests) {
  console.log('\n🎯 The compressed PDF text extraction is working correctly!');
} else {
  console.log('\n🔧 Some issues detected. Check the failed tests above.');
}
