// Load .env file for local development (file won't exist during EAS builds)
try {
    require('dotenv').config();
} catch (e) {
    // dotenv is optional for EAS builds where env vars are injected directly
}

module.exports = ({ config }) => {
    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

    // Log for debugging during builds
    if (!googleMapsApiKey) {
        console.warn('⚠️ GOOGLE_MAPS_API_KEY is not set! Maps will not work.');
    } else {
        console.log('✅ Google Maps API Key found.');
    }

    return {
        ...config,
        android: {
            ...config.android,
            config: {
                ...config.android?.config,
                googleMaps: {
                    apiKey: googleMapsApiKey
                }
            }
        }
    };
};
