# 🌟 GNW's POS & Inventory System (My Capstone Project) 🌟

<p align="center">
  <img src="public/assets/images/GNW_logo_brighter.png" alt="GNW Logo" width="200"/>
</p>

Hey there! Welcome to the repo for my capstone project: a Point-of-Sale and Inventory Management system I built for a local shop called GNW. It's a desktop app made with Electron and Node.js, designed to help a business with multiple branches run things smoothly.

---

### **⚠️ A Quick Heads-Up**

This project is here to show what I can build. The app itself runs, but you won't be able to log in or use most of its features right away. That's because the database we were using (a free one on Supabase) is no longer active.

To get it fully working again, you'd need to set up a new Supabase project and plug the new credentials into the app. But the code itself is all here and shows how everything was built.

---

## ✨ So, What Does It Do?

I built this with two main users in mind: the central admin/owner and the staff at each branch.

### 👨‍💼 For the Admin (The Main Hub)

This is the command center for the whole operation. From here, the admin can:

- **See a Live Dashboard:** The first thing you see is a dashboard that gives you a live look at sales and logins across all branches. I used WebSockets for this, so there's no need to refresh the page to see new activity.

- **Manage All the Branches:** You can add new store locations, keep an eye on them, and even turn them "on" or "off." Each store gets its own secret key to log in, which the admin manages.

- **Control the Inventory:** This is the core of the system. You can add new products, edit their details, and manage stock levels. I also added an "archive" feature, so you can hide old products from the POS without deleting them forever. This keeps the sales history intact.

- **Keep a Supplier List:** A simple place to keep track of all your supplier contacts so you don't have to hunt for their info.

- **Check Sales & Reports:** This section lets you check how the business is doing. You can see which products are selling well and look at total sales over different date ranges.

- **View Activity Logs:** To help keep everything secure and accountable, there's a log that shows who logged in, what inventory was changed, and all the sales that were made.

### 🏢 For the Branch Staff (The Point of Sale)

The POS interface is designed to be simple and fast for daily use.

- **Secure Login:** Each store logs in with its own unique account, so all sales and actions are tracked by location.

- **Process Orders Quickly:** The checkout process is straightforward. Staff can find products, add them to a cart, and process the sale. The system handles all the calculations and automatically updates the stock count in the database.

- **Print Real Receipts:** I hooked it up to work with thermal printers (`escpos` library), so it can print out a proper receipt for the customer right after a sale.

---

## 🚀 A Few Cool Features Under the Hood

Here are a couple of the more technical features I'm proud of:

### The Forecasting Tool (DSS)

One of the main goals of the project was to build a tool that could help predict stock needs. 

- It uses a **Simple Moving Average (SMA)** algorithm on the last 30 days of sales data to guess how much of a product will be needed soon. The idea was to help the owner avoid running out of popular items.
- The interesting part is how it works: the main Node.js app calls a **Python script** to do the actual math. It was a fun challenge to get the two languages talking to each other.

### Live Data with WebSockets

To make the admin dashboard feel responsive and modern, I used WebSockets. When a sale happens at a branch, it pops up on the admin's screen instantly. This was way better than having the admin constantly hit the refresh button to see what's new.

---

## 🛠️ Tech I Used

Here's a list of the main technologies I used to build this project:

-   **Backend:** Node.js, Express.js
-   **Frontend:** EJS (Embedded JavaScript templates), CSS, Vanilla JavaScript
-   **Desktop App Framework:** Electron.js
-   **Database:** Supabase (PostgreSQL)
-   **Forecasting Script:** Python (with Pandas)
-   **Real-time Stuff:** WebSockets
-   **Other Key Libraries:** `bcrypt` (for passwords), `jsonwebtoken` (for auth), `nodemailer` (for emails), `escpos` (for the receipt printer).
