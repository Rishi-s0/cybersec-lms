const mongoose = require('mongoose');
const Certificate = require('../models/Certificate');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function inspectCertificates() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const certs = await Certificate.find().sort({ issuedAt: -1 }).limit(5);
        console.log(`Found ${certs.length} certificates.`);

        certs.forEach(c => {
            console.log('------------------------------------------------');
            console.log(`ID: ${c.certificateId}`);
            console.log(`Student: "${c.studentName}"`);
            console.log(`Course: "${c.courseName}"`);
            console.log(`Instructor: "${c.instructorName}"`);
            console.log(`Issued: ${c.issuedAt}`);
            console.log(`Signature: ${c.digitalSignature ? 'Present' : 'MISSING'}`);
            console.log(`Verification: ${c.verificationCode}`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

inspectCertificates();
