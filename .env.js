const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(process.cwd(), process.env.REACT_APP_ENV_PATH || '.env');

if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    if (k.startsWith('REACT_APP_') || ['GOOGLE_MAPS_API_KEY', 'API_BASE_URL'].includes(k)) {
      process.env[`REACT_APP_${k}`] = envConfig[k];
    }
  }
}