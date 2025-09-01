const fs = require('fs');
const path = require('path');

// Define the mapping of NB values to better fallback values
const nbReplacements = {
  '"NB"': '"Onbekend"',
  "'NB'": "'Onbekend'",
  'NB,': 'Onbekend,',
  'NB;': 'Onbekend;',
  'NB\n': 'Onbekend\n',
  'NB ': 'Onbekend ',
  ' NB': ' Onbekend',
  'NB.': 'Onbekend.',
  'NB:': 'Onbekend:',
  'NB)': 'Onbekend)',
  'NB(': '(Onbekend',
  'NB[': '[Onbekend',
  'NB]': 'Onbekend]',
  'NB{': '{Onbekend',
  'NB}': 'Onbekend}',
  'NB<': '<Onbekend',
  'NB>': 'Onbekend>',
  'NB|': 'Onbekend|',
  'NB\\': 'Onbekend\\',
  'NB/': 'Onbekend/',
  'NB*': 'Onbekend*',
  'NB+': 'Onbekend+',
  'NB=': 'Onbekend=',
  'NB!': 'Onbekend!',
  'NB?': 'Onbekend?',
  'NB~': 'Onbekend~',
  'NB`': 'Onbekend`',
  'NB@': 'Onbekend@',
  'NB#': 'Onbekend#',
  'NB$': 'Onbekend$',
  'NB%': 'Onbekend%',
  'NB^': 'Onbekend^',
  'NB&': 'Onbekend&',
  'NB_': 'Onbekend_',
  'NB-': 'Onbekend-',
  'NB\n': 'Onbekend\n',
  'NB\r': 'Onbekend\r',
  'NB\t': 'Onbekend\t'
};

// Files to process
const filesToProcess = [
  'services/ai_services/invoice_analysis_library.js',
  'services/ai_services/improved_invoice_processing.js',
  'services/ai_services/professional_invoice_processing.js'
];

console.log('🔧 Fixing NB values in service files...\n');

let totalReplacements = 0;
let filesProcessed = 0;

filesToProcess.forEach(filePath => {
  try {
    const fullPath = path.resolve(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      console.log(`📝 Processing: ${filePath}`);
      
      let content = fs.readFileSync(fullPath, 'utf8');
      let fileReplacements = 0;
      
      // Apply all NB replacements
      Object.entries(nbReplacements).forEach(([oldValue, newValue]) => {
        const regex = new RegExp(oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        if (content.includes(oldValue)) {
          content = content.replace(regex, newValue);
          fileReplacements++;
        }
      });
      
      if (fileReplacements > 0) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`  ✅ ${fileReplacements} replacements made`);
        totalReplacements += fileReplacements;
        filesProcessed++;
      } else {
        console.log(`  ℹ️  No NB values found`);
      }
      
    } else {
      console.log(`❌ File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 NB value fixing completed!`);
console.log(`📊 Files processed: ${filesProcessed}/${filesToProcess.length}`);
console.log(`📊 Total replacements: ${totalReplacements}`);

if (totalReplacements > 0) {
  console.log('\n📋 Next steps:');
  console.log('1. Run tests to verify NB values are fixed');
  console.log('2. Test invoice analysis functionality');
  console.log('3. Commit and push changes');
} else {
  console.log('\n✅ No NB values found to fix');
}
