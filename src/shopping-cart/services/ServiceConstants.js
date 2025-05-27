const ENV_CONFIG = window._env_ || {};


module.exports.GOOGLE_CLIENT_ID = ENV_CONFIG.GOOGLE_CLIENNT_ID || "513697266883-8hstsstsludtgpfps9q2iqvgd56eh1d6.apps.googleusercontent.com";
module.exports.API_URL = ENV_CONFIG.API_URL || "http://localhost:5000/api";