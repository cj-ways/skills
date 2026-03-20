// SAFE: All secrets come from environment variables
export const config = {
  apiKey: process.env.API_KEY,
  database: {
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || "5432"),
    name: process.env.DB_NAME,
  },
};
