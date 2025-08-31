const { createFallbackResponse } = require('./services/improved_invoice_processing.js');

console.log('🧪 Testing improved extraction function...\n');

const testText = `ALBERT HEIJN
FILIAAL 1427
Parijsplein 19
070-3935033

22/08/2025 12:55

AANTAL OMSCHRIJVING PRIJS BEDRAG
BONUSKAART: xx0802
AIRMILES NR.: xx6254
1 BOODSCH TAS: 1,59
1 DZH HV MELK: 1,99
1 DZH YOGHURT: 2,29
1 HONING: 2,25
3 BAPAO: 0,99
1 DZH CREME FR: 1,09
1 ZAANSE HOEVE: 2,69 25%
1 BOTERH WORST: 1,49
1 SCHOUDERHAM: 1,79
1 AH ROOMBRIE: 2,99
1 CHERRYTOMAAT: 1,19
1 AH SALADE: 3,29 B
1 AH SALADE: 2,79 B
1 VRUCHT HAGEL: 2,59
1 ROZ KREN BOL: 2,69
2 VOLK BOLLEN: 1,59
1 DE ICE CARAM: 1,59
1 APPELFLAP: 1,78 B

21 SUBTOTAAL: 40,24

BONUS AHROOMBOTERA: -0,79
BONUS AHSALADES175: -2,33
25% K ZAANSE HOEVE: -0,67

UW VOORDEEL: 3,79
waarvan BONUS BOX PREMIUM: 0,00

SUBTOTAAL: 36,45

74 KOOPZEGELS PREMIUM: 7,40

TOTAAL: 43,85

6 eSPAARZEGELS PREMIUM
28 MIJN AH MILES PREMIUM

BETAALD MET:
PINNEN: 43,85

Totaal betaald: 43,85 EUR

POI: 50282895
Terminal: 5F2GVM
Merchant: 1315641
Periode: 5234
Transactie: 02286653
Maestro: A0000000043060
Bank: ABN AMRO BANK
Kaart: 673400xxxxxxxxx2056
Kaartserienummer: 5
Autorisatiecode: F30005
Leesmethode: CHIP

BTW OVER EUR
9%: 31,98 2,88
21%: 1,31 0,28
TOTAAL: 33,29 3,16

1427 12:54
35 41
22-8-2025

Vragen over je kassabon? Onze collega's helpen je graag`;

console.log('📄 Test text length:', testText.length, 'characters\n');

const result = createFallbackResponse(testText, 'TEST_IMPROVED_001');

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
  console.log('\n🎯 The improved extraction function is working correctly!');
} else {
  console.log('\n🔧 Some issues detected. Check the failed tests above.');
}
