const puppeteer = require('puppeteer');

/**
 * Generate PDF from HTML content
 * @param {string} html - HTML content to render
 * @param {object} options - PDF options (optional)
 * @returns {Promise<Buffer>} - PDF buffer
 */
const generatePDF = async (html, options = {}) => {
    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Set content and wait for network idle to ensure fonts/images load
        await page.setContent(html, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Default PDF options
        const pdfOptions = {
            format: 'A4',
            printBackground: true,
            landscape: true, // Certificates usually look better in landscape
            margin: {
                top: '10mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm'
            },
            ...options
        };

        const pdfBuffer = await page.pdf(pdfOptions);
        return pdfBuffer;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

module.exports = { generatePDF };
