const convict = require("convict");

// Define a schema
const config = convict({
  env: {
    doc: "Type of environment for Deer Daily App",
    format: ["production", "development", "test"],
    default: "development",
    env: "DEER_DAILY_ENV",
  },
  ip: {
    doc: "The IP address for the server to bind to.",
    format: "ipaddress",
    default: "127.0.0.1",
    env: "DEER_DAILY_IP",
  },
  port: {
    doc: "The port for the server to bind to.",
    format: "port",
    default: 8080,
    env: "DEER_DAILY_PORT",
  },
  username: {
    doc: "The username for the Deer Daily App",
    default: "",
    env: "DEER_DAILY_USERNAME",
  },
  password: {
    doc: "The password for the Deer Daily App",
    default: "",
    env: "DEER_DAILY_PASSWORD",
  },
  botKey: {
    doc: "The api key for the Deer Daily App Bot",
    default: "",
    env: "DEER_DAILY_BOT_KEY"
  },
});

// Perform validation
config.validate({allowed: 'strict'});

module.exports = config;