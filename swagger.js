const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "E-Commerce API Documentation",
    description: "Production-ready RESTful API for E-Commerce platform",
    version: "1.0.0",
  },
  host: "localhost:8000",
  schemes: ["http"],
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      description:
        "Enter your Bearer token: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YThiMWIxNjAxMzlkY2JiNzA0NmQ5ZjQiLCJpYXQiOjE3ODg3OTU5NjcsImV4cCI6MTc5NjU3MTk2N30.UaOlm6xiQ9VeIiNiAIImcVWxB326cPupZvUa7ncw5_M",
    },
  },
};

const outputFile = "./swagger-output.json";
const routesFiles = ["./routes/index"];

swaggerAutogen(outputFile, routesFiles, doc);
