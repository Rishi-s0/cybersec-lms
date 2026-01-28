const mongoose = require('mongoose');
const Progress = require('../models/Progress');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function resetCertificate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Find the corrupt progress
        const progress = await Progress.findOne({
            'certificate.issued': true
        }).populate('user');

        if (progress) {
            console.log(`Found progress for ${progress.user.email}`);
            console.log(`Current Cert ID: ${progress.certificate.certificateId}`);

            // Reset
            progress.certificate.issued = false;
            progress.certificate.certificateId = undefined;
            progress.certificate.issuedAt = undefined;
            // keep isCompleted = true

            await progress.save();
            console.log('✅ Reset progress certificate status.');

            // Also delete any partial certs if they exist (though we think they don't)
            const deleted = await Certificate.deleteMany({ user: progress.user });
            console.log(`Deleted ${deleted.deletedCount} orphaned certificates.`);

        } else {
            console.log('No progress found with issued certificate.');
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

resetCertificate();
