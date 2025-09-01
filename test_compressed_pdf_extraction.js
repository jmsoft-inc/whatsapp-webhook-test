const { createFallbackResponse } = require('./services/improved_invoice_processing');

// Test with the actual compressed text from Render.com logs
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
graag
`;

console.log('🧪 Testing improved extraction with compressed PDF text...\n');

const result = createFallbackResponse(compressedText, 'TEST-INV-001');

console.log('\n📊 EXTRACTION RESULTS:');
console.log('=====================');
console.log(`Date: ${result.date}`);
console.log(`Time: ${result.time}`);
console.log(`Subtotal before discount: ${result.subtotal_before_discount}`);
console.log(`Subtotal after discount: ${result.subtotal}`);
console.log(`BTW 9%: ${result.tax_9}`);
console.log(`BTW 21%: ${result.tax_21}`);
console.log(`BTW 9% Base: ${result.btw_breakdown?.btw_9_base || 'N/A'}`);
console.log(`BTW 21% Base: ${result.btw_breakdown?.btw_21_base || 'N/A'}`);
console.log(`Bonus amount: ${result.bonus_amount}`);
console.log(`Voordeel amount: ${result.voordeel_amount}`);
console.log(`Koopzegels amount: ${result.koopzegels_amount}`);
console.log(`Koopzegels count: ${result.koopzegels_count}`);
console.log(`Total amount: ${result.total_amount}`);
console.log(`Payment PIN: ${result.payment_pin}`);
console.log(`Item count: ${result.item_count}`);
console.log(`Filiaal: ${result.store_info?.filiaal || 'N/A'}`);
console.log(`Adres: ${result.store_info?.adres || 'N/A'}`);
console.log(`Telefoon: ${result.store_info?.telefoon || 'N/A'}`);
console.log(`Transactie: ${result.store_info?.transactie || 'N/A'}`);
console.log(`Terminal: ${result.store_info?.terminal || 'N/A'}`);
console.log(`Merchant: ${result.store_info?.merchant || 'N/A'}`);
console.log(`Bonuskaart: ${result.loyalty?.bonuskaart || 'N/A'}`);
console.log(`Air Miles: ${result.loyalty?.air_miles || 'N/A'}`);

console.log('\n🎯 EXPECTED VALUES:');
console.log('==================');
console.log('Date: 2025-08-22');
console.log('Time: 12:55');
console.log('Subtotal before discount: 40.24');
console.log('Subtotal after discount: 36.45');
console.log('BTW 9%: 2.88');
console.log('BTW 21%: 0.28');
console.log('BTW 9% Base: 31.98');
console.log('BTW 21% Base: 1.31');
console.log('Bonus amount: 3.79');
console.log('Voordeel amount: 3.79');
console.log('Koopzegels amount: 7.4');
console.log('Koopzegels count: 74');
console.log('Total amount: 43.85');
console.log('Payment PIN: 43.85');
console.log('Item count: 21');
console.log('Filiaal: 1427');
console.log('Adres: Parijsplein 19');
console.log('Telefoon: 070-3935033');
console.log('Transactie: 02286653');
console.log('Terminal: 5F2GVM');
console.log('Merchant: 1315641');
console.log('Bonuskaart: xx0802');
console.log('Air Miles: xx6254');

// Calculate accuracy
const expected = {
  date: '2025-08-22',
  time: '12:55',
  subtotal_before_discount: 40.24,
  subtotal: 36.45,
  tax_9: 2.88,
  tax_21: 0.28,
  btw_9_base: 31.98,
  btw_21_base: 1.31,
  bonus_amount: 3.79,
  voordeel_amount: 3.79,
  koopzegels_amount: 7.4,
  koopzegels_count: 74,
  total_amount: 43.85,
  payment_pin: 43.85,
  item_count: 21,
  filiaal: '1427',
  adres: 'Parijsplein 19',
  telefoon: '070-3935033',
  transactie: '02286653',
  terminal: '5F2GVM',
  merchant: '1315641',
  bonuskaart: 'xx0802',
  air_miles: 'xx6254'
};

const actual = {
  date: result.date,
  time: result.time,
  subtotal_before_discount: result.subtotal_before_discount,
  subtotal: result.subtotal,
  tax_9: result.tax_9,
  tax_21: result.tax_21,
  btw_9_base: result.btw_breakdown?.btw_9_base || 0,
  btw_21_base: result.btw_breakdown?.btw_21_base || 0,
  bonus_amount: result.bonus_amount,
  voordeel_amount: result.voordeel_amount,
  koopzegels_amount: result.koopzegels_amount,
  koopzegels_count: result.koopzegels_count,
  total_amount: result.total_amount,
  payment_pin: result.payment_pin,
  item_count: result.item_count,
  filiaal: result.store_info?.filiaal || 'NB',
  adres: result.store_info?.adres || 'NB',
  telefoon: result.store_info?.telefoon || 'NB',
  transactie: result.store_info?.transactie || 'NB',
  terminal: result.store_info?.terminal || 'NB',
  merchant: result.store_info?.merchant || 'NB',
  bonuskaart: result.loyalty?.bonuskaart || 'NB',
  air_miles: result.loyalty?.air_miles || 'NB'
};

let correct = 0;
let total = 0;

console.log('\n✅ ACCURACY CHECK:');
console.log('==================');

Object.keys(expected).forEach(key => {
  total++;
  const expectedVal = expected[key];
  const actualVal = actual[key];
  
  if (expectedVal === actualVal) {
    console.log(`✅ ${key}: ${actualVal}`);
    correct++;
  } else {
    console.log(`❌ ${key}: Expected ${expectedVal}, Got ${actualVal}`);
  }
});

console.log(`\n🎯 ACCURACY: ${correct}/${total} (${Math.round(correct/total*100)}%)`);
