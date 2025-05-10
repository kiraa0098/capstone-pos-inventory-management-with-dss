const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");
const { startServer } = require("./index"); // Import startServer function
const supabase = require("./src/services/database");

let branchId = null;
let branchName = null;
let personelName = null;

// Conditionally include electron-reload only in development
if (process.env.NODE_ENV !== "production") {
  try {
    require("electron-reload")(path.join(__dirname, "src"), {
      electron: path.join(__dirname, "node_modules", "electron", "cli.js"), // Update path
    });
  } catch (error) {
    console.error("Could not load electron-reload:", error);
  }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    maximizable: true,
    maximized: true,
    webPreferences: {
      nodeIntegration: false, // Disable nodeIntegration for security
      contextIsolation: true, // Enable context isolation
      preload: path.join(__dirname, "preload.js"), // Point to preload.js
      devTools: true,
    },
    icon: path.join(
      __dirname,
      "public",
      "assets",
      "images",
      "application_icon.png"
    ),
  });

  // Remove the default menu bar if necessary
  Menu.setApplicationMenu(null); // Remove the application menu

  // Add event listener to capture load errors
  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription) => {
      console.error(`Failed to load: ${errorDescription}`);
    }
  );

  // Load the local server URL
  mainWindow.loadURL("http://localhost:3000");
}

// Handle app termination events asynchronously
async function handleAppTermination() {
  console.log("The application is being terminated.");
  console.log("Branch ID:", branchId);
  console.log("Branch Name:", branchName);
  console.log("Personel Name:", personelName);

  // Validate that the required fields are not null or undefined
  if (!branchId || !branchName || !personelName) {
    console.error(
      "Validation failed: Missing required fields (branchId, branchName, personelName). Skipping logout history insertion."
    );
    return; // Exit the function if any required field is missing
  }

  try {
    // Insert the logout data into the login_history table
    const { data, error } = await supabase.from("login_history").insert([
      {
        login_date: new Date().toISOString(), // Current timestamp
        login_branch_id: branchId, // Branch ID
        login_branch_name: branchName, // Branch Name
        login_branch_personel_name: personelName, // Personnel Name
        Action: "logged out",
      },
    ]);

    // Handle the response and possible errors
    if (error) {
      console.error("Error inserting logout history:", error);
    } else {
      console.log("Logout history inserted successfully:", data);
    }
  } catch (err) {
    console.error("Error during logout history insertion:", err);
  }
}

app.whenReady().then(async () => {
  try {
    await startServer(); // Wait for the server to start
    setTimeout(createWindow, 1000); // Add a delay to ensure the server is ready
  } catch (error) {
    console.error("Failed to start server:", error);
    app.quit();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// When the app is about to quit
app.on("window-all-closed", async () => {
  if (process.platform !== "darwin") {
    await handleAppTermination();
    app.quit();
  }
});

app.on("ready", () => {
  app.setAppUserModelId(process.execPath);
});

// Listen for login data from renderer (sent through ipc)
ipcMain.on(
  "login-data",
  (
    event,
    token,
    branchIdFromRenderer,
    branchNameFromRenderer,
    personelNameFromRenderer
  ) => {
    console.log("Received login data from renderer:");
    console.log("Token:", token);
    console.log("Branch ID:", branchIdFromRenderer);
    console.log("Branch Name:", branchNameFromRenderer);
    console.log("Personel Name:", personelNameFromRenderer);

    // Set the global variables to the values from the renderer
    branchId = branchIdFromRenderer;
    branchName = branchNameFromRenderer;
    personelName = personelNameFromRenderer;

    console.log("Updated Global Branch ID:", branchId);
    console.log("Updated Global Branch Name:", branchName);
    console.log("Updated Global Personel Name:", personelName);

    event.reply("login-data-received", "Login data successfully received.");
  }
);
