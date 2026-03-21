const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = './documentation_screenshots';
// Use seeded credentials
const STUDENT_EMAIL = 'student@hackademy.com';
const STUDENT_PASSWORD = 'password123';
const ADMIN_EMAIL = 'admin@hackademy.com';
const ADMIN_PASSWORD = 'password123';

// Utility function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function takeScreenshot(page, filename, fullPage = false) {
    const filepath = path.join(SCREENSHOT_DIR, filename);
    await page.screenshot({
        path: filepath,
        fullPage: fullPage,
        type: 'png'
    });
    console.log(`✅ Screenshot saved: ${filepath}`);
}

// Helper for Xpath (since page.$x is deprecated)
async function $x(page, expression) {
    return page.$$(`xpath/${expression}`);
}

async function runTests() {
    console.log('🚀 Continuing automated screenshot capture (TC-05 to TC-20)...\n');

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: {
            width: 1920,
            height: 1080
        },
        args: ['--start-maximized']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    try {
        // LOGIN FIRST
        console.log('🔑 Logging in as Student...');
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
        await page.type('input[name="email"]', STUDENT_EMAIL);
        await page.type('input[name="password"]', STUDENT_PASSWORD);
        await page.click('button[type="submit"]');
        await wait(3000);

        // ========================================
        // TC-05: Course Enrollment
        // ========================================
        console.log('\n📋 TC-05: Course Enrollment');
        await page.goto(`${BASE_URL}/courses`, { waitUntil: 'networkidle0' });
        await wait(2000);

        // Click on first course
        const courseCards = await page.$$('.htb-card, div[class*="card"]');
        if (courseCards.length > 0) {
            await courseCards[0].click();
            await wait(2000);
            await takeScreenshot(page, 'tc05_1_details.png', true);

            // Try to enroll
            const [enrollBtn] = await $x(page, '//button[contains(., "Enroll")]');
            if (enrollBtn) {
                // Check if disabled/Already Enrolled
                const text = await page.evaluate(el => el.textContent, enrollBtn);
                console.log(`Button text: ${text}`);

                if (!text.includes('Already Enrolled')) {
                    await enrollBtn.click();
                    await wait(2000);
                    await takeScreenshot(page, 'tc05_2_enrolled.png');
                } else {
                    console.log('ℹ️ User already enrolled. Skipping click.');
                    await takeScreenshot(page, 'tc05_2_already_enrolled.png');
                }
            } else {
                console.log('Enroll button not found');
            }

            // Go to dashboard to show enrolled
            await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
            await wait(2000);
            await takeScreenshot(page, 'tc05_3_dashboard_enrolled.png', true);
        }

        // ========================================
        // TC-06: Progress Tracking
        // ========================================
        console.log('\n📋 TC-06: Progress Tracking');
        // From dashboard, continue learning
        const [startLink] = await $x(page, '//a[contains(., "Continue Learning") or contains(., "Start Learning")]');
        if (startLink) {
            await startLink.click();
            await wait(3000);
            await takeScreenshot(page, 'tc06_progress.png', true);

            // We are in lesson view. Try to mark complete.
            const [completeBtn] = await $x(page, '//button[contains(., "Mark as Complete")]');
            if (completeBtn) {
                await completeBtn.click();
                await wait(2000);
                await takeScreenshot(page, 'tc06_progress_updated.png');
            }
        }

        // ========================================
        // TC-07 & TC-08: Quiz Assessment
        // ========================================
        console.log('\n📋 TC-07/08: Quiz Assessment');
        // Try to find "Quiz" button or tab.
        const [quizTab] = await $x(page, '//button[contains(., "Quiz")]');
        if (quizTab) {
            await quizTab.click();
            await wait(1000);
            await takeScreenshot(page, 'tc07_quiz_start.png');

            // Empty submission (TC-08)
            const [submitBtn] = await $x(page, '//button[contains(., "Submit")]');
            if (submitBtn) {
                await submitBtn.click();
                await wait(1000);
                await takeScreenshot(page, 'tc08_empty.png');
            } // Wait to proceed

            // Need to refind submit button if page re-rendered? Or just proceed.
            // Assuming no reload.

            // Fill answers (TC-07) - random guess
            const options = await page.$$('input[type="radio"]');
            if (options.length > 0) {
                await options[0].click(); // Select first option
                // Re-find submit button
                const [submitBtn2] = await $x(page, '//button[contains(., "Submit")]');
                if (submitBtn2) await submitBtn2.click();
                await wait(2000);
                await takeScreenshot(page, 'tc07_results.png');
            }
        }

        // ========================================
        // TC-09 & TC-10: Threat Map
        // ========================================
        console.log('\n📋 TC-09/10: Threat Map');
        await page.goto(`${BASE_URL}/threat-map`, { waitUntil: 'networkidle0' });
        await wait(5000);
        await takeScreenshot(page, 'tc09_map.png', true);

        // TC-10 Filter
        const filterButtons = await page.$$('button');
        let capturedFilter = false;
        for (const button of filterButtons) {
            const text = await page.evaluate(el => el.textContent, button);
            if (text.includes('Filter') || text.includes('Country') || text.includes('Type')) {
                await button.click();
                await wait(1000);
                const option = await page.$('div[role="option"], li');
                if (option) await option.click();

                await wait(2000);
                await takeScreenshot(page, 'tc10_filter.png', true);
                capturedFilter = true;
                break;
            }
        }
        if (!capturedFilter) {
            await takeScreenshot(page, 'tc10_filter_fallback.png', true);
        }

        // ========================================
        // TC-11: Password Strength
        // ========================================
        console.log('\n📋 TC-11: Password Strength');
        await page.goto(`${BASE_URL}/tools`, { waitUntil: 'networkidle0' });
        await wait(2000);

        // Find tool link if needed...
        // Just try inputting
        const passInput = await page.$('input[placeholder*="Pass"], input[type="password"]');
        if (passInput) {
            await passInput.type('12345');
            await wait(1000);
            await takeScreenshot(page, 'tc11_weak.png');
        }

        // ========================================
        // TC-12: Malware Scanner
        // ========================================
        console.log('\n📋 TC-12: Malware Scanner');
        await takeScreenshot(page, 'tc12_scan_ui.png');

        // ========================================
        // TC-13 & TC-14: Forum
        // ========================================
        console.log('\n📋 TC-13/14: Forum');
        await page.goto(`${BASE_URL}/forum`, { waitUntil: 'networkidle0' });
        await wait(2000);

        const [newPostBtn] = await $x(page, '//button[contains(., "New Discussion")] | //a[contains(., "New Discussion")]');
        if (newPostBtn) {
            await newPostBtn.click();
            await wait(1000);
            await page.type('input[name="title"], input[placeholder*="Title"]', 'Test Discussion Topic');
            const textarea = await page.$('textarea');
            if (textarea) await textarea.type('This is a test discussion body.');

            await takeScreenshot(page, 'tc13_post_form.png');

            const [postSubmit] = await $x(page, '//button[@type="submit"]');
            if (postSubmit) {
                await postSubmit.click();
                await wait(2000);
                await takeScreenshot(page, 'tc13_post_created.png');
            }
        }

        // Reply
        await page.goto(`${BASE_URL}/forum`, { waitUntil: 'networkidle0' }); // Go back to list
        await wait(1000);
        const postLinks = await page.$$('h3, a[href*="forum"]');
        if (postLinks.length > 0) {
            await postLinks[0].click();
            await wait(2000);

            const replyBox = await page.$('textarea');
            if (replyBox) {
                await replyBox.type('This is a test reply.');
                const [replyBtn] = await $x(page, '//button[contains(., "Reply") or contains(., "Post")]');
                if (replyBtn) {
                    await replyBtn.click();
                    await wait(2000);
                    await takeScreenshot(page, 'tc14_reply.png');
                }
            }
        }

        // ========================================
        // TC-15: Certificate
        // ========================================
        console.log('\n📋 TC-15: Certificate');
        await page.goto(`${BASE_URL}/certificates`, { waitUntil: 'networkidle0' });
        await wait(2000);
        await takeScreenshot(page, 'tc15_certificate.png', true);

        // ========================================
        // TC-16: SQL Injection
        // ========================================
        console.log('\n📋 TC-16: SQL Injection');
        await page.deleteCookie({ name: 'token', url: BASE_URL });
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });

        await page.type('input[name="email"]', "admin' OR '1'='1");
        await page.type('input[name="password"]', 'anything');
        await page.click('button[type="submit"]');
        await wait(2000);
        await takeScreenshot(page, 'tc16_sqli.png');

        // ========================================
        // TC-17: XSS
        // ========================================
        console.log('\n📋 TC-17: XSS');
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
        await page.type('input[name="email"]', STUDENT_EMAIL);
        await page.type('input[name="password"]', STUDENT_PASSWORD);
        await page.click('button[type="submit"]');
        await wait(2000);
        await page.goto(`${BASE_URL}/forum`, { waitUntil: 'networkidle0' });
        await takeScreenshot(page, 'tc17_xss_check.png');

        // ========================================
        // TC-18: Mobile
        // ========================================
        console.log('\n📋 TC-18: Mobile');
        await page.setViewport({ width: 375, height: 812 });
        await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
        await wait(1000);
        await takeScreenshot(page, 'tc18_mobile.png', true);
        await page.setViewport({ width: 1920, height: 1080 });

        // ========================================
        // TC-19: Admin Create Course
        // ========================================
        console.log('\n📋 TC-19: Admin Create Course');
        await page.deleteCookie({ name: 'token', url: BASE_URL });
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });

        await page.type('input[name="email"]', ADMIN_EMAIL);
        await page.type('input[name="password"]', ADMIN_PASSWORD);
        await page.click('button[type="submit"]');
        await wait(3000);

        await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle0' });
        await wait(2000);

        const [createCourseBtn] = await $x(page, '//button[contains(., "New Course") or contains(., "Create Course")]');
        if (createCourseBtn) {
            await createCourseBtn.click();
            await wait(2000);
            await takeScreenshot(page, 'tc19_create_course.png', true);
        } else {
            await takeScreenshot(page, 'tc19_admin_dashboard.png', true);
        }

        // ========================================
        // TC-20: Admin Delete User
        // ========================================
        console.log('\n📋 TC-20: Admin Delete User');
        await page.goto(`${BASE_URL}/admin/users`, { waitUntil: 'networkidle0' }).catch(() => { });
        await wait(2000);
        await takeScreenshot(page, 'tc20_delete_user_ui.png', true);

        console.log('\n✅ Screenshot capture completed!');
        console.log(`📁 Screenshots saved in: ${SCREENSHOT_DIR}`);

    } catch (error) {
        console.error('❌ Error during screenshot capture:', error);
        await takeScreenshot(page, 'error_state.png');
    } finally {
        await browser.close();
    }
}

runTests().catch(console.error);
