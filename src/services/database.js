// src/services/supabase.js
const { createClient } = require("@supabase/supabase-js");
const path = require("path");
const { app } = require("electron");
const isProduction = process.env.NODE_ENV === "production";

// Load environment variables
if (isProduction) {
  require("dotenv").config({ path: path.join(app.getAppPath(), ".env") });
} else {
  require("dotenv").config();
}

const supabaseUrl =
  process.env.SUPABASE_URL || "https://lshsykxyoucflyowjxvc.supabase.co";
const supabaseKey =
  process.env.SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzaHN5a3h5b3VjZmx5b3dqeHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTgwMDc2ODIsImV4cCI6MjAzMzU4MzY4Mn0.H-0nGNfdStQ9DBvyYrcH1H7FrBGw4Vgd6Fd4dHxOy3M";
const supabase = createClient(supabaseUrl, supabaseKey);
module.exports = supabase;
