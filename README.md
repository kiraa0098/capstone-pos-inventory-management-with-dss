# Capstone POS: GNW's Point-of-Sale & Inventory Management System

<p align="center">
  <img src="public/assets/images/GNW_logo_brighter.png" alt="GNW Logo" width="200"/>
</p>

This repository contains a capstone project: a full-featured Point-of-Sale and Inventory Management desktop application. Built with Electron and Node.js, it was designed to provide a centralized management solution for a multi-branch retail business.

---

### **Project Status Notice**

**This project is presented for portfolio and demonstration purposes.** The application is runnable, but its features are not accessible without a database connection. The original Supabase backend is no longer active, so logging in or accessing data requires configuring the application to connect to a new database instance. The codebase, however, is complete and demonstrates the full scope of the system's architecture and functionality.

---

## Core Features

### Admin Panel

The central hub for business management, providing administrators with control over the entire operation.

- **Live Dashboard:** The main dashboard offers a real-time overview of business operations, including live sales data and recent user activity, updated via WebSockets.

- **Branch Management:** Administrators can manage all store branches from a central interface. This includes adding new locations, updating branch information, and issuing unique security keys for POS access.

- **Inventory Control:** Provides comprehensive inventory management with full CRUD (Create, Read, Update, Delete) functionality. Products can be archived to hide them from the POS without deleting historical sales data, and stock levels can be adjusted as needed.

- **Supplier Directory:** Includes a module to maintain a directory of supplier information, centralizing procurement contacts.

- **Sales & Analytics:** The system generates reports on sales, product performance, and revenue, with options to filter by date ranges for detailed analysis.

- **Audit Logs:** For security and accountability, the system logs all major actions, including inventory changes, sales transactions, and user logins.

### Branch Point-of-Sale (POS)

A streamlined interface for branch employees to handle day-to-day transactions.

- **Secure POS Access:** Each branch accesses the POS using unique credentials, ensuring all transactions are correctly attributed and tracked.

- **Efficient Order Processing:** The POS interface is designed for efficient transaction handling. Staff can search for products, manage a shopping cart, and process sales or refunds. Inventory levels are updated automatically in the database.

- **Receipt Printing:** Integrates directly with thermal printers (via the `escpos` library) to generate and print customer receipts after each transaction.

---

## Technical Highlights

### Forecasting Engine (DSS)

A key feature of this project is the Decision Support System (DSS) for stock forecasting. It provides data-driven estimates to help management make smarter inventory decisions using a time-series forecasting method.

#### How the Calculation Works: Simple Moving Average (SMA)

The model uses a **Simple Moving Average (SMA)** to forecast future demand based on recent performance. The process is as follows:

1.  **Data Collection:** For each product, the system gathers the sales data from the last 30 days.
2.  **Calculate Daily Average:** It then computes the average number of units sold per day over that 30-day period. Days with no sales are counted as zero to ensure the average is a realistic reflection of recent activity.
3.  **Forecast Future Demand:** This daily average is then multiplied by a 30-day lead time to project the total demand for the upcoming month. The formula is essentially:

    `(Total Sales in Last 30 Days / 30) * 30 = Forecasted Demand for Next 30 Days`

This calculation is handled by a Python script (`sma_forecast.py`) that is called by the main Node.js application, demonstrating a practical use of polyglot programming.

### Real-Time UI with WebSockets

WebSockets are used to push live data from the branches to the admin dashboard. This ensures that management has an immediate and accurate view of sales and activity without needing to manually refresh the interface, providing a modern and responsive user experience.

---

## System Architecture & Tech Stack

The application is built on the following technologies:

-   **Backend:** Node.js, Express.js
-   **Frontend:** EJS (Embedded JavaScript templates), CSS3, Vanilla JavaScript
-   **Desktop Framework:** Electron.js
-   **Database:** Supabase (PostgreSQL)
-   **Forecasting Engine:** Python (with Pandas)
-   **Real-time Communication:** WebSockets
-   **Key Libraries:** `bcrypt`, `jsonwebtoken`, `nodemailer`, `escpos`