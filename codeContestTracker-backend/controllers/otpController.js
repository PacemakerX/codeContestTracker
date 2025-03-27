const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // Store in env

/**
 * Generates a temporary JWT token valid for 10 minutes
 * @param {string} email - User's email address
 * @returns {string} JWT token
 */
const generateTempToken = (email) => {
    return jwt.sign({ email }, JWT_SECRET, { expiresIn: "10m" });
};

/**
 * Class to manage OTP generation, storage, and verification
 */
class OTPManager {
    constructor() {
        // In-memory storage for OTPs using Map data structure
        this.otpStore = new Map();

        // Set up automatic cleanup of expired OTPs every 5 minutes
        this.cleanupInterval = setInterval(() => {
            const now = Date.now();
            for (const [key, value] of this.otpStore.entries()) {
                if (now > value.expiresAt) {
                    this.otpStore.delete(key);
                }
            }
        }, 5 * 60 * 1000); 
    }

    /**
     * Generates a random 6-digit OTP
     * @returns {string} 6-digit OTP
     */
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Stores OTP with an expiration time of 5 minutes
     * @param {string} email - User's email address
     * @param {string} otp - Generated OTP
     */
    storeOTP(email, otp) {
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiration
        this.otpStore.set(email, { otp, expiresAt });
    }

    /**
     * Verifies if the provided OTP matches and is not expired
     * @param {string} email - User's email address
     * @param {string} otp - OTP to verify
     * @returns {boolean} True if OTP is valid, false otherwise
     */
    verifyOTP(email, otp) {
        const otpEntry = this.otpStore.get(email);
        if (!otpEntry) return false;

        if (otpEntry.otp === otp && Date.now() <= otpEntry.expiresAt) {
            this.otpStore.delete(email); // Remove OTP after successful verification
            return true;
        }
        return false;
    }
}

// Create singleton instance of OTPManager
const otpManager = new OTPManager();

/**
 * Controller class for handling OTP-related operations
 */
class OTPController {
    /**
     * Sends OTP to user's email
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async sendOTP(req, res) {
        try {
            const { email } = req.body;

            // Input validation
            if (!email) {
                return res.status(400).json({ message: "Email is required" });
            }

            // Generate and store new OTP
            const otp = otpManager.generateOTP();
            otpManager.storeOTP(email, otp);

            // Configure email transport
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            // Send email with OTP
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Your OTP for Email Verification",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>OTP Verification</h2>
                        <p>Your One-Time Password (OTP) is:</p>
                        <h1 style="letter-spacing: 10px; color: #007bff;">${otp}</h1>
                        <p>This OTP will expire in 5 minutes.</p>
                    </div>
                `,
            });

            res.status(200).json({ message: "OTP sent successfully" });
        } catch (error) {
            console.error("OTP Send Error:", error);
            res.status(500).json({ message: "Failed to send OTP", error: error.message });
        }
    }

    /**
     * Verifies the OTP provided by the user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async verifyOTP(req, res) {
        try {
            const { email, otp } = req.body;

            // Input validation
            if (!email || !otp) {
                return res.status(400).json({ message: "Email and OTP are required" });
            }

            // Verify OTP validity
            const isValid = otpManager.verifyOTP(email, otp);
            if (!isValid) {
                return res.status(400).json({ message: "Invalid or expired OTP" });
            }

            const emailVerificationToken = generateTempToken(email);

            res.status(200).json({
                message: "OTP verified successfully",
                emailVerificationToken,
            });
        } catch (error) {
            console.error("OTP Verification Error:", error);
            res.status(500).json({ message: "OTP verification failed", error: error.message });
        }
    }
}

module.exports = OTPController;
