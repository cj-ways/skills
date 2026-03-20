export const config = {
  apiKey: "sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234",
  appName: "MyApp",
  database: {
    host: "db.production.internal",
    password: "SuperSecret!Pr0d#2026",
    port: 5432,
    name: "myapp_prod",
  },
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },
};
