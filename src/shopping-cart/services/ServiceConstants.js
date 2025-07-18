const ENV_CONFIG = window._env_ || {};


module.exports.GOOGLE_CLIENT_ID = ENV_CONFIG.GOOGLE_CLIENNT_ID || "513697266883-8hstsstsludtgpfps9q2iqvgd56eh1d6.apps.googleusercontent.com";
module.exports.API_URL = ENV_CONFIG.API_URL || "http://localhost:5000/api";
module.exports.REACT_APP_RAZORPAY_KEY_ID = ENV_CONFIG.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_GR7TLLltswTpEy'