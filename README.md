# 🌟 Capstone POS: GNW's Point-of-Sale & Inventory Management System 🌟

<p align="center">
  <img src="public/assets/images/GNW_logo_brighter.png" alt="GNW Logo" width="200"/>
</p>

Welcome to the repository for the **GNW Shop Point-of-Sale**, a comprehensive desktop application developed as a capstone project. Built with **Electron** and **Node.js**, this system provides a powerful suite of tools for multi-branch retail management, from real-time inventory tracking to intelligent stock forecasting.

---

### **⚠️ Portfolio & Demonstration Notice**

**This project is intended for portfolio and demonstration purposes.** The application is runnable, but it **cannot fully function** as the original **Supabase** backend (database and services) is no longer active. This means you cannot log in or access data-dependent features without setting up a new Supabase project and configuring the application to connect to it. However, the codebase represents a complete and functional system, showcasing a wide range of software engineering skills and sophisticated features.

---

## ✨ Core Features: A Detailed Look

### 👨‍💼 Admin Central Command

The heart of the system is the admin panel, a powerful command center offering deep, centralized control over the entire retail operation.

- **📊 At-a-Glance Dashboard:** The application opens to a dynamic dashboard providing a real-time overview of the business. It features live updates on sales across all branches, a log of recent branch logins, and critical notifications, such as low-stock alerts, powered by WebSocket for instant data synchronization.

- **🏪 Multi-Branch Management:** Seamlessly add, monitor, and manage multiple store branches. Each new branch is assigned a unique, system-generated branch key for secure POS login. The admin can view branch details, update information (like address or contact), and enable or disable branch activity, providing full control over the network.

- **📦 Advanced Inventory Control:** This is a complete inventory management suite. Admins can perform full CRUD (Create, Read, Update, Delete) operations on products, manage categories, and handle stock levels. 
    - **Restocking:** Easily increment stock counts for products.
    - **Archiving:** Deactivate products without permanently deleting them, preserving historical data.
    - **Unarchiving:** Restore previously archived products back to active status.

- **🚚 Supplier Database:** Maintain a comprehensive directory of suppliers. For each supplier, the system stores crucial information, including company name, contact person, and contact details, centralizing procurement information for easier management.

- **📈 Sales & Analytics:** Dive deep into your business performance with a robust reporting module. Generate detailed reports on overall sales, individual product performance, and revenue generated across specific timeframes. This data-driven insight is crucial for strategic decision-making.

- **🧾 Full Log Monitoring:** Enhance security and accountability with comprehensive logging. The system meticulously tracks and displays inventory adjustments (restocks, deletions), sales transactions, and a full history of branch login attempts, providing a clear audit trail.

### 🏢 Branch-Level POS

A streamlined and intuitive interface designed for efficiency, allowing branch staff to handle daily operations with ease.

- **🔐 Secure Branch Login:** Each branch uses its unique, admin-provided credentials to access the POS system, ensuring that sales and inventory data are correctly attributed to the specific location.

- **🛒 Efficient Order Processing:** The POS interface is optimized for speed. Staff can quickly search the inventory for products, add items to a customer's cart, process sales, and handle refunds. The system automatically calculates totals and updates inventory levels in real-time.

- **🧾 Custom Receipt Printing:** Upon completing a transaction, the system generates a detailed receipt and sends it directly to a connected thermal printer using the `escpos` library. This allows for professional, physical receipts for customers without any extra steps.

---

## 🚀 Key Functionalities: A Technical Deep Dive

### Decision Support System (DSS) for Stock Forecasting

This isn't just a standard POS. The system includes a custom-built Decision Support System that provides intelligent, data-driven stock forecasts.

- **💡 Predictive Analytics:** It forecasts future product demand using a **Simple Moving Average (SMA)** algorithm. By analyzing sales data from the previous 30 days, it helps management make proactive stocking decisions and prevent stockouts.
- **🤖 Automated Calculation:** The process is handled by a powerful combination of a **Python script** (`sma_forecast.py`) for the core calculation and a **Node.js controller** (`getForecast.js`) that manages the data flow, demonstrating polyglot programming skills.
- **📉 Optimized Stock Levels:** This feature empowers management to move from reactive to predictive inventory control, minimizing both overstock and stockout scenarios to directly impact profitability.

### Real-Time Data Sync with WebSockets

The application uses **WebSockets** to ensure data is synchronized across all connected clients in real-time, making the admin dashboard a true central command center.

- **⚡ Instant Notifications:** Sales, inventory changes, and login activities are instantly pushed from the POS to the admin dashboard without needing a page refresh. This provides management with a live, accurate view of operations as they happen.
- **🤝 Collaborative View:** This technology ensures that central management always has the most current and accurate data from every branch, facilitating better-informed, immediate decision-making.

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