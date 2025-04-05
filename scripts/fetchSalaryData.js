const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const url =
  'https://www.gov.uk/government/publications/skilled-worker-visa-going-rates-for-eligible-occupations/skilled-worker-visa-going-rates-for-eligible-occupation-codes';

axios
  .get(url)
  .then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);
    const salaryData = [];

    $('table').each((i, table) => {
      $(table)
        .find('tbody tr')
        .each((index, element) => {
          const tds = $(element).find('td');

          if (tds.length >= 5) {
            const occupationCode = $(tds[0]).text().trim();
            const jobTitle = $(tds[1]).text().trim();
            const annualSalaryText = $(tds[2]).text().replace(/[^0-9]/g, '');
            const hourlyRateText = $(tds[3]).text().replace(/[^0-9.]/g, '');
            const notes = $(tds[4]).text().trim();

            const annualSalary = parseInt(annualSalaryText, 10) || 0;
            const hourlyRate = parseFloat(hourlyRateText) || 0;

            if (occupationCode && jobTitle) {
              salaryData.push({
                occupationCode,
                jobTitle,
                annualSalary,
                hourlyRate,
                notes,
              });
            }
          }
        });
    });

    console.log(`✅ Parsed ${salaryData.length} entries.`);

    const outputPath = path.join(__dirname, '../data/salaryData.json');
    fs.writeFileSync(
      outputPath,
      JSON.stringify(salaryData, null, 2),
      'utf-8'
    );
    console.log('✅ Data successfully saved to data/salaryData.json');
  })
  .catch((error) => {
    console.error('❌ Error fetching data:', error);
  });
