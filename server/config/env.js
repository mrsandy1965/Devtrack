/**
 * Validates that all required environment variables are present.
 * Fails fast on startup so the server never runs in a broken state.
 */
const REQUIRED_VARS = ['MONGO_URI', 'JWT_SECRET'];

const validateEnv = () => {
  const missing = REQUIRED_VARS.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.error(`\n❌ Missing required environment variables:\n   ${missing.join(', ')}\n`);
    console.error('   Copy server/.env.example → server/.env and fill in the values.\n');
    process.exit(1);
  }
};

module.exports = validateEnv;
