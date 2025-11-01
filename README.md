# 🌟 Capstone POS: GNW's Point-of-Sale & Inventory Management System 🌟

<p align="center">
  <img src="public/assets/images/GNW_logo_brighter.png" alt="GNW Logo" width="200"/>
</p>

Welcome to the repository for the **GNW Shop Point-of-Sale**, a comprehensive desktop application developed as a capstone project. Built with **Electron** and **Node.js**, this system provides a powerful suite of tools for multi-branch retail management, from real-time inventory tracking to intelligent stock forecasting.

---

### **⚠️ Portfolio & Demonstration Notice**

**This project is intended for portfolio and demonstration purposes.** The application is runnable, but it **cannot fully function** as the original **Supabase** backend (database and services) is no longer active. This means you cannot log in or access data-dependent features without setting up a new Supabase project and configuring the application to connect to it. However, the codebase represents a complete and functional system, showcasing a wide range of software engineering skills and sophisticated features.

---

## ✨ Core Features

### 👨‍💼 Admin Central Command

The heart of the system is the admin panel, offering centralized control over the entire retail operation.

- **📊 At-a-Glance Dashboard:** Real-time overview of sales, branch logins, and key metrics.
- **🏪 Multi-Branch Management:** Seamlessly add, monitor, and manage multiple store branches, including unique branch keys for security.
- **📦 Advanced Inventory Control:** A complete toolkit for product management—add, edit, archive, and restock items across all locations.
- **🚚 Supplier Database:** Maintain a comprehensive list of suppliers for streamlined procurement and management.
- **📈 Sales & Analytics:** Dive deep into sales data, product performance, and revenue reports with detailed filtering.
- **🧠 Decision Support System (DSS):** Predictive stock forecasting to prevent stockouts and optimize inventory levels.
- **🧾 Full Log Monitoring:** Track inventory adjustments, sales history, and branch login activity with detailed, real-time logs.

### 🏢 Branch-Level POS

A streamlined and intuitive interface for branch staff to handle daily operations with ease.

- **🔐 Secure Branch Login:** Dedicated and secure access for each individual branch.
- **🛒 Efficient Order Processing:** A fast and user-friendly point-of-sale system for handling customer transactions.
- **🧾 Custom Receipt Printing:** Generate and print customer receipts for every sale, compatible with thermal printers.

---

## 🚀 Key Functionalities: A Deeper Dive

### Decision Support System (DSS) for Stock Forecasting

This isn't just a standard POS. The system includes a custom-built Decision Support System that uses a **Simple Moving Average (SMA)** algorithm to provide intelligent insights.

- **💡 Predictive Analytics:** It forecasts future product demand based on historical sales data over a 30-day window, helping management make proactive stocking decisions.
- **🤖 Automated Calculation:** A **Python script** (`sma_forecast.py`) and a **Node.js controller** (`getForecast.js`) work in tandem to process sales data and generate lead time demand estimates.
- **📉 Optimized Stock Levels:** This feature empowers management to minimize both overstock and stockout scenarios, directly impacting profitability.

### Real-Time Data Sync with WebSockets

The application uses **WebSockets** to ensure data is synchronized across all connected clients in real-time, making the admin dashboard a true central command center.

- **⚡ Instant Notifications:** Sales, inventory changes, and login activities are instantly pushed to the admin dashboard without needing to refresh.
- **🤝 Collaborative View:** Ensures that central management always has the most current and accurate view of what’s happening in every branch.

### Robust Technology Stack

This project was built using a modern and robust set of technologies, demonstrating expertise in full-stack desktop application development.

-   **Backend:** Node.js, Express.js
-   **Frontend:** EJS (Embedded JavaScript templates), CSS3, Vanilla JavaScript
-   **Desktop App Framework:** Electron.js
-   **Database & BaaS:** Supabase (PostgreSQL)
-   **Forecasting Engine:** Python (using Pandas)
-   **Real-time Communication:** WebSockets
-   **Key Libraries:**
    -   `bcrypt`: For secure password hashing.
    -   `jsonwebtoken`: For stateless authentication (JWT).
    -   `nodemailer`: For email functionalities like password resets.
    -   `escpos`: For direct communication with thermal receipt printers.
