/**
 * StudentApp - Unified Study Management Application
 * A comprehensive productivity suite for students featuring task management,
 * time tracking, note-taking, and calendar functionality.
 *
 * @author Team Doberman
 * @version 1.0.0
 * @description Complete student productivity application with four core modules:
 *              - Todo List: Task management with drag-drop reordering
 *              - Pomodoro Timer: Focused work sessions with visual progress
 *              - Notes: Quick note-taking with CRUD operations
 *              - Calendar: Event and task scheduling system
 */

// ============================================================================
// ENHANCED GLOBAL STATE MANAGEMENT
// ============================================================================

/** Current active section/view in the application */
let currentSection = "home";

/** Enhanced todo list state with localStorage integration */
let tasks = {};
let draggedItem = null;

/** Enhanced Pomodoro timer state with persistence */
let workDuration = 25 * 60;
let shortBreak = 5 * 60;
let longBreak = 15 * 60;
let current = workDuration;
let interval = null;
let isRunning = false;
let session = "Work";

/** Application settings with localStorage persistence */
let appSettings = {
  theme: 'default',
  language: 'en',
  autoSave: true,
  pomodoroSettings: {
    workDuration: 25,
    shortBreak: 5,
    longBreak: 15,
    autoStartBreaks: false,
    soundEnabled: true
  }
};

// ============================================================================
// ENHANCED DATA PERSISTENCE SYSTEM
// ============================================================================

/**
 * Advanced localStorage manager with error handling and data validation
 */
const DataManager = {
  /**
   * Safely saves data to localStorage with error handling
   * @param {string} key - Storage key
   * @param {any} data - Data to store
   * @returns {boolean} Success status
   */
  save: function(key, data) {
    try {
      const serializedData = JSON.stringify({
        data: data,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
      localStorage.setItem(`studentapp_${key}`, serializedData);
      return true;
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
      return false;
    }
  },

  /**
   * Safely loads data from localStorage with validation
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if load fails
   * @returns {any} Loaded data or default value
   */
  load: function(key, defaultValue = null) {
    try {
      const serializedData = localStorage.getItem(`studentapp_${key}`);
      if (!serializedData) return defaultValue;
      
      const parsedData = JSON.parse(serializedData);
      return parsedData.data || defaultValue;
    } catch (error) {
      console.error(`Failed to load ${key}:`, error);
      return defaultValue;
    }
  },

  /**
   * Removes data from localStorage
   * @param {string} key - Storage key
   */
  remove: function(key) {
    try {
      localStorage.removeItem(`studentapp_${key}`);
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
    }
  },

  /**
   * Gets all stored data keys
   * @returns {Array} Array of storage keys
   */
  getAllKeys: function() {
    try {
      return Object.keys(localStorage).filter(key => key.startsWith('studentapp_'));
    } catch (error) {
      console.error('Failed to get storage keys:', error);
      return [];
    }
  }
};

/**
 * Enhanced navigation system with state persistence and analytics
 * @param {string} sectionName - Target section identifier
 */
function showSection(sectionName) {
  // Hide all content sections by removing active class
  const sections = document.querySelectorAll(".content-section");
  sections.forEach((section) => section.classList.remove("active"));

  // Reset navigation tabs to inactive state
  const navTabs = document.querySelectorAll(".nav-tab");
  navTabs.forEach((tab) => tab.classList.remove("active"));

  // Show selected section
  document.getElementById(sectionName + "-section").classList.add("active");
  event.target.classList.add("active");

  // Update global state tracker
  currentSection = sectionName;

  // Save current section to localStorage for session restoration
  DataManager.save('currentSection', sectionName);

  // Initialize section-specific functionality
  switch (sectionName) {
    case "todo":
      initializeTodoList();
      break;
    case "pomodoro":
      initializePomodoro();
      break;
    case "notes":
      displayNotes();
      break;
    case "calendar":
      initializeCalendar();
      break;
    case "home":
      updateDashboardStats();
      break;
  }

  // Track section usage for analytics
  trackSectionUsage(sectionName);
}

/**
 * Updates dashboard statistics and overview
 */
function updateDashboardStats() {
  try {
    const totalTasks = Object.keys(DataManager.load('tasks', {})).length;
    const completedTasks = Object.values(DataManager.load('tasks', {})).filter(task => task.completed).length;
    const totalNotes = (DataManager.load('notes', []) || []).length;
    const totalEvents = (DataManager.load('studentapp-events', []) || []).length;

    // Update stats display if elements exist
    const statsElements = {
      'total-tasks': totalTasks,
      'completed-tasks': completedTasks,
      'total-notes': totalNotes,
      'total-events': totalEvents
    };

    Object.entries(statsElements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
  } catch (error) {
    console.error('Error updating dashboard stats:', error);
  }
}

/**
 * Tracks section usage for analytics
 * @param {string} sectionName - Section being accessed
 */
function trackSectionUsage(sectionName) {
  try {
    const analytics = DataManager.load('analytics', {});
    const today = new Date().toDateString();
    
    if (!analytics[today]) analytics[today] = {};
    if (!analytics[today][sectionName]) analytics[today][sectionName] = 0;
    
    analytics[today][sectionName]++;
    DataManager.save('analytics', analytics);
  } catch (error) {
    console.error('Error tracking section usage:', error);
  }
}

/**
 * Real-time clock functionality
 */
function updateDateTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString();
  const dateString = now.toDateString();

  // Update header display
  document.getElementById("current-time").textContent = timeString;
  document.getElementById("current-date").textContent = dateString;
}

/**
 * Application initialization - sets up core functionality and event listeners
 * Includes error handling and performance monitoring for production readiness
 */
document.addEventListener("DOMContentLoaded", function () {
  try {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Load all persisted data on startup
    loadPersistedData();
    
    // Initialize all sections with saved data
    displayNotes();
    
    // Auto-save data periodically (every 30 seconds)
    setInterval(saveAllData, 30000);

    // Performance optimization: preload critical sections
    const criticalElements = [
      "current-time",
      "current-date",
      "notes-list",
      "task-container",
      "timer",
      "calendar-row",
    ];

    criticalElements.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.style.willChange = "auto";
      }
    });

    console.log("StudentApp v1.0.0 initialized successfully by Team Doberman");
  } catch (error) {
    console.error("StudentApp initialization failed:", error);
    alert("Error loading StudentApp. Please refresh the page.");
  }
});

// ===============================
// DATA PERSISTENCE SYSTEM
// ===============================

/**
 * Saves all application data to localStorage
 */
function saveAllData() {
  try {
    const appData = {
      todos: tasks,
      pomodoroSettings: {
        workDuration,
        shortBreak,
        longBreak,
        currentSession: session,
        currentTime: current,
        isRunning: false // Don't persist running state
      },
      notes: JSON.parse(localStorage.getItem('notes')) || [],
      events: JSON.parse(localStorage.getItem('studentapp-events')) || [],
      calendarTasks: JSON.parse(localStorage.getItem('studentapp-calendar-tasks')) || [],
      lastSaved: new Date().toISOString()
    };
    
    localStorage.setItem('studentapp-data', JSON.stringify(appData));
    console.log('Data auto-saved at', new Date().toLocaleTimeString());
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

/**
 * Loads all persisted data from localStorage
 */
function loadPersistedData() {
  try {
    const savedData = localStorage.getItem('studentapp-data');
    if (!savedData) {
      console.log('No saved data found, starting fresh');
      return;
    }

    const appData = JSON.parse(savedData);
    
    // Restore todo tasks
    if (appData.todos) {
      tasks = appData.todos;
      console.log(`Loaded ${Object.keys(tasks).length} todo tasks`);
    }
    
    // Restore pomodoro settings
    if (appData.pomodoroSettings) {
      workDuration = appData.pomodoroSettings.workDuration || 25 * 60;
      shortBreak = appData.pomodoroSettings.shortBreak || 5 * 60;
      longBreak = appData.pomodoroSettings.longBreak || 15 * 60;
      session = appData.pomodoroSettings.currentSession || "Work";
      current = appData.pomodoroSettings.currentTime || workDuration;
      console.log('Loaded Pomodoro settings');
    }
    
    console.log(`Data loaded from ${appData.lastSaved}`);
  } catch (error) {
    console.error('Error loading persisted data:', error);
  }
}

/**
 * Exports all data as JSON for backup
 */
function exportData() {
  saveAllData();
  const data = localStorage.getItem('studentapp-data');
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `studentapp-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  alert('Data exported successfully!');
}

/**
 * Imports data from JSON backup file
 */
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      localStorage.setItem('studentapp-data', JSON.stringify(importedData));
      alert('Data imported successfully! Refreshing page...');
      location.reload();
    } catch (error) {
      alert('Invalid backup file format!');
      console.error('Import error:', error);
    }
  };
  reader.readAsText(file);
}

// ===============================
// TODO LIST FUNCTIONALITY
// ===============================

function initializeTodoList() {
  // Generate weekly calendar
  setupWeeklyCalendar();
  // Set up event listeners
  setupTodoEvents();
  // Initialize drag and drop
  setupDragAndDrop();
  // Load and display saved tasks
  loadSavedTasks();
}

function setupWeeklyCalendar() {
  const calendarRow = document.getElementById("calendar-row");
  if (!calendarRow) return;

  const today = new Date();
  const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentDayOfWeek = today.getDay();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - currentDayOfWeek);

  calendarRow.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + i);
    const dateString = date.toISOString().split("T")[0];
    const dayNumber = date.getDate();
    const dayName = weekdayNames[i];

    const dayColumn = document.createElement("div");
    dayColumn.className = "flex flex-col items-center space-y-1";
    dayColumn.dataset.date = dateString;

    const dayText = document.createElement("span");
    dayText.className = "text-sm font-semibold";
    dayText.textContent = dayName;

    const dateCircle = document.createElement("span");
    dateCircle.className =
      "h-7 w-7 rounded-full cursor-pointer transition-all flex justify-center items-center text-sm font-semibold";
    dateCircle.innerHTML = `<p>${dayNumber}</p>`;

    // Style based on date
    if (date.toDateString() === today.toDateString()) {
      dayText.classList.add("text-black");
      dateCircle.classList.add("bg-blue-200", "text-black");
    } else if (date < today) {
      dayText.classList.add("text-gray-400");
      dateCircle.classList.add("bg-gray-100", "text-gray-500");
    } else {
      dayText.classList.add("text-[#5b7a9d]");
      dateCircle.classList.add(
        "bg-white",
        "text-black",
        "hover:bg-[#063c76]",
        "hover:text-white"
      );
    }

    dayColumn.appendChild(dayText);
    dayColumn.appendChild(dateCircle);
    calendarRow.appendChild(dayColumn);
  }
}

function setupTodoEvents() {
  const addTaskBtn = document.getElementById("add-task-btn");
  const cancelTask = document.getElementById("cancel-task");
  const saveTask = document.getElementById("save-task");

  if (addTaskBtn) {
    addTaskBtn.addEventListener("click", () => {
      document.getElementById("task-modal").classList.remove("hidden");
      populateDayDropdown();
    });
  }

  if (cancelTask) {
    cancelTask.addEventListener("click", () => {
      document.getElementById("task-modal").classList.add("hidden");
      document.getElementById("task-title").value = "";
      document.getElementById("task-time").value = "";
    });
  }

  if (saveTask) {
    saveTask.addEventListener("click", () => {
      const title = document.getElementById("task-title").value;
      const date = document.getElementById("task-day").value;
      const time = document.getElementById("task-time").value;

      if (!title || !date || !time) {
        alert("Please fill all fields.");
        return;
      }

      if (date !== "future") {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
          alert("Cannot set a task in the past.");
          return;
        }
      }

      addTask(title, time);
      document.getElementById("task-modal").classList.add("hidden");
      document.getElementById("task-title").value = "";
      document.getElementById("task-time").value = "";
    });
  }
}

function populateDayDropdown() {
  const dropdown = document.getElementById("task-day");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dropdown.innerHTML = "";

  const days = document.querySelectorAll("#calendar-row > div");
  days.forEach((day) => {
    const dayName = day.querySelector("span:first-child").textContent;
    const dayNumber = day.querySelector("span:last-child p").textContent;
    const dateStr = day.dataset.date;

    if (dateStr) {
      const dayDate = new Date(dateStr);
      dayDate.setHours(0, 0, 0, 0);
      if (dayDate >= today) {
        const displayText = `${dayName} ${dayNumber}`;
        dropdown.innerHTML += `<option value="${dateStr}">${displayText}</option>`;
      }
    }
  });

  const futureOption = document.createElement("option");
  futureOption.value = "future";
  futureOption.textContent = "Select Future Date...";
  dropdown.appendChild(futureOption);
}

function addTask(title, time24) {
  const taskId = Date.now();
  const selectedDate = document.getElementById("task-day").value;

  // Convert 24-hour to 12-hour format
  const [hour, minute] = time24.split(":");
  let hour12 = parseInt(hour, 10);
  const ampm = hour12 >= 12 ? "PM" : "AM";
  hour12 = hour12 % 12 || 12;
  const time12 = `${hour12}:${minute} ${ampm}`;

  // Format date
  const dateObj = new Date(selectedDate);
  const weekday = dateObj.toLocaleDateString("en-US", { weekday: "short" });
  const day = dateObj.getDate();
  const month = dateObj.toLocaleDateString("en-US", { month: "short" });
  const formattedDate = `${weekday} ${day} ${month}`;

  const taskHTML = `
        <li class="mt-4" id="${taskId}" draggable="true" ondragstart="drag(event)">
            <div class="flex gap-2">
                <div class="w-7/12 h-12 bg-[#e0ebff] rounded-[7px] flex items-center px-3 justify-between">
                    <div class="flex items-center">
                        <span 
                            id="check${taskId}" 
                            class="w-7 h-7 bg-white rounded-full border border-white cursor-pointer hover:border-[#36d344] flex justify-center items-center" 
                            onclick="toggleTask(${taskId})"
                        >
                            <i class="text-white fa fa-check"></i>
                        </span>
                        <strike 
                            id="strike${taskId}" 
                            class="strike_none text-sm ml-4 text-[#5b7a9d] font-semibold"
                        >
                            ${title}
                        </strike>
                    </div>
                </div>
                <span class="w-1/6 h-12 bg-[#e0ebff] rounded-[7px] flex justify-center items-center text-xs text-[#5b7a9d] font-semibold">
                    ${formattedDate}
                </span>
                <span class="w-1/6 h-12 bg-[#e0ebff] rounded-[7px] flex justify-center items-center text-xs text-[#5b7a9d] font-semibold">
                    ${time12}
                </span>
            </div>
        </li>
    `;

  document
    .getElementById("task-container")
    .insertAdjacentHTML("beforeend", taskHTML);

  tasks[taskId] = {
    title,
    time: time12,
    date: formattedDate,
    completed: false,
  };
}

function toggleTask(id) {
  const strike = document.getElementById(`strike${id}`);
  const check = document.getElementById(`check${id}`);

  const isDone = strike.classList.contains("strike_none");

  strike.classList.toggle("strike_none");
  strike.classList.toggle("line-through");
  check.classList.toggle("bg-[#36d344]");

  if (tasks[id]) {
    tasks[id].completed = !isDone;
  }
}

function drag(event) {
  draggedItem = event.target;
  event.target.classList.add("dragging");
}

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll("li:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

function setupDragAndDrop() {
  const taskContainer = document.getElementById("task-container");
  if (taskContainer) {
    taskContainer.addEventListener("dragover", function (e) {
      e.preventDefault();
      const afterElement = getDragAfterElement(this, e.clientY);
      const draggable = draggedItem;

      if (afterElement == null) {
        this.appendChild(draggable);
      } else {
        this.insertBefore(draggable, afterElement);
      }
    });

    taskContainer.addEventListener("dragend", function (e) {
      e.target.classList.remove("dragging");
    });
  }
}

/**
 * Loads and displays all saved tasks from localStorage
 */
function loadSavedTasks() {
  const taskContainer = document.getElementById("task-container");
  if (!taskContainer) return;

  // Clear existing tasks in UI
  taskContainer.innerHTML = "";

  // Load tasks from storage and display them
  Object.entries(tasks).forEach(([taskId, task]) => {
    const taskHTML = `
      <li class="mt-4" id="${taskId}" draggable="true" ondragstart="drag(event)">
        <div class="flex gap-2">
          <div class="w-7/12 h-12 bg-[#e0ebff] rounded-[7px] flex items-center px-3 justify-between">
            <div class="flex items-center">
              <span 
                id="check${taskId}" 
                class="w-7 h-7 bg-white rounded-full border border-white cursor-pointer hover:border-[#36d344] flex justify-center items-center ${task.completed ? 'bg-[#36d344]' : ''}" 
                onclick="toggleTask(${taskId})"
              >
                <i class="text-white fa fa-check"></i>
              </span>
              <strike 
                id="strike${taskId}" 
                class="${task.completed ? 'line-through' : 'strike_none'} text-sm ml-4 text-[#5b7a9d] font-semibold"
              >
                ${task.title}
              </strike>
            </div>
          </div>
          <span class="w-1/6 h-12 bg-[#e0ebff] rounded-[7px] flex justify-center items-center text-xs text-[#5b7a9d] font-semibold">
            ${task.date}
          </span>
          <span class="w-1/6 h-12 bg-[#e0ebff] rounded-[7px] flex justify-center items-center text-xs text-[#5b7a9d] font-semibold">
            ${task.time}
          </span>
        </div>
      </li>
    `;
    taskContainer.insertAdjacentHTML("beforeend", taskHTML);
  });

  console.log(`Loaded ${Object.keys(tasks).length} saved tasks`);
}

// ===============================
// POMODORO TIMER FUNCTIONALITY
// ===============================

function initializePomodoro() {
  const timerElement = document.getElementById("timer");
  const progressCircle = document.querySelector(".progress");

  if (!timerElement || !progressCircle) return;

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  progressCircle.style.strokeDasharray = circumference;

  updateDisplay();
}

function updateDisplay() {
  const timerElement = document.getElementById("timer");
  const progressCircle = document.querySelector(".progress");

  if (!timerElement || !progressCircle) return;

  const minutes = Math.floor(current / 60);
  const seconds = current % 60;
  timerElement.textContent = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (current / getSessionDuration()) * circumference;
  progressCircle.style.strokeDashoffset = offset;

  // Dynamic color transition
  const percent = current / getSessionDuration();
  let r, g, b;
  if (percent > 0.5) {
    const t = (1 - percent) * 2;
    r = Math.round(0 + (255 - 0) * t);
    g = 255;
    b = Math.round(99 - 99 * t);
  } else {
    const t = 1 - percent * 2;
    r = 255;
    g = Math.round(255 - 255 * t);
    b = 0;
  }
  progressCircle.style.stroke = `rgb(${r},${g},${b})`;
}

function getSessionDuration() {
  if (session === "Work") return workDuration;
  if (session === "Short Break") return shortBreak;
  return longBreak;
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  interval = setInterval(() => {
    if (current === 0) {
      clearInterval(interval);
      isRunning = false;
      if (session === "Work") {
        session = "Short Break";
        current = shortBreak;
        alert("Work done! Time for a break.");
      } else if (session === "Short Break") {
        session = "Work";
        current = workDuration;
        alert("Break over! Back to work.");
      }
      updateDisplay();
      return;
    }
    current--;
    updateDisplay();
  }, 1000);
}

function pauseTimer() {
  clearInterval(interval);
  isRunning = false;
  updateDisplay();
}

function resetTimer() {
  pauseTimer();
  session = "Work";
  current = workDuration;
  updateDisplay();
}

function toggleEditTime() {
  const setTimePanel = document.getElementById("set-time-panel");
  const editTimeBtn = document.getElementById("edit-time-btn");

  if (
    (setTimePanel && setTimePanel.style.display === "none") ||
    setTimePanel.style.display === ""
  ) {
    setTimePanel.style.display = "flex";
    editTimeBtn.textContent = "Close";
    pauseTimer();
  } else if (setTimePanel) {
    setTimePanel.style.display = "none";
    editTimeBtn.textContent = "Edit Time";
  }
}

function setCustomTimes() {
  const workInput = document.getElementById("work-min");
  const shortInput = document.getElementById("short-min");
  const longInput = document.getElementById("long-min");

  const workVal = parseInt(workInput.value);
  const shortVal = parseInt(shortInput.value);
  const longVal = parseInt(longInput.value);

  if (isNaN(workVal) || workVal < 1) {
    alert("Work time must be a positive number.");
    workInput.focus();
    return;
  }
  if (isNaN(shortVal) || shortVal < 1) {
    alert("Short break time must be a positive number.");
    shortInput.focus();
    return;
  }
  if (isNaN(longVal) || longVal < 1) {
    alert("Long break time must be a positive number.");
    longInput.focus();
    return;
  }

  workDuration = workVal * 60;
  shortBreak = shortVal * 60;
  longBreak = longVal * 60;

  if (session === "Work") current = workDuration;
  else if (session === "Short Break") current = shortBreak;
  else current = longBreak;

  updateDisplay();

  const setTimePanel = document.getElementById("set-time-panel");
  const editTimeBtn = document.getElementById("edit-time-btn");
  if (setTimePanel) setTimePanel.style.display = "none";
  if (editTimeBtn) editTimeBtn.textContent = "Edit Time";
}

// ===============================
// NOTES FUNCTIONALITY
// ===============================

function popup() {
  const popupContainer = document.createElement("div");
  popupContainer.innerHTML = `
    <div id="popupContainer" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div class="bg-white p-6 rounded-lg w-96">
            <h1 class="text-xl font-semibold mb-4">New note</h1>
            <textarea id="note-text" placeholder="Enter your note..." class="w-full h-32 border border-gray-300 rounded px-3 py-2 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
            <div id="btn-container" class="flex justify-end gap-2">
                <button id="submitBtn" onclick="createNote()" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Create Note</button>
                <button id="closeBtn" onclick="closePopup()" class="px-4 py-2 text-gray-600 hover:text-gray-800">Close</button>
            </div>
        </div>
    </div>
    `;
  document.body.appendChild(popupContainer);

  setTimeout(() => {
    document.getElementById("note-text").focus();
  }, 100);
}

function closePopup() {
  const popupContainer = document.getElementById("popupContainer");
  if (popupContainer) {
    popupContainer.remove();
  }
}

function createNote() {
  const popupContainer = document.getElementById("popupContainer");
  const noteText = document.getElementById("note-text").value;
  if (noteText.trim() !== "") {
    const timestamp = new Date().toISOString();
    const note = {
      id: new Date().getTime(),
      text: noteText,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const existingNotes = JSON.parse(localStorage.getItem("notes")) || [];
    existingNotes.push(note);

    localStorage.setItem("notes", JSON.stringify(existingNotes));
    popupContainer.remove();
    displayNotes();
  }
}

function displayNotes() {
  const notesList = document.getElementById("notes-list");
  if (!notesList) return;

  notesList.innerHTML = "";

  const notes = JSON.parse(localStorage.getItem("notes")) || [];

  notes.forEach((note) => {
    const listItem = document.createElement("div");
    listItem.className =
      "note-item w-48 h-40 m-2 p-3 bg-yellow-100 border border-yellow-200 rounded-lg shadow-sm relative";

    const createdAt = new Date(note.createdAt).toLocaleString();

    listItem.innerHTML = `
            <div class="text-xs text-gray-600 mb-2">Created: ${createdAt}</div>
            <div class="text-sm overflow-hidden h-20">${note.text}</div>
            <div id="noteBtns-container" class="absolute bottom-2 right-2 flex gap-1">
                <button id="editBtn" onclick="editNote(${note.id})" class="text-blue-600 hover:text-blue-800">
                    <i class="fa-solid fa-pen text-xs"></i>
                </button>
                <button id="deleteBtn" onclick="deleteNote(${note.id})" class="text-red-600 hover:text-red-800">
                    <i class="fa-solid fa-trash text-xs"></i>
                </button>
            </div>
        `;
    notesList.appendChild(listItem);
  });
}

function editNote(noteId) {
  const notes = JSON.parse(localStorage.getItem("notes")) || [];
  const noteToEdit = notes.find((note) => note.id == noteId);
  const noteText = noteToEdit ? noteToEdit.text : "";
  const updatedAt = noteToEdit
    ? new Date(noteToEdit.updatedAt).toLocaleString()
    : "";

  const editingPopup = document.createElement("div");

  editingPopup.innerHTML = `
    <div id="editing-container" data-note-id="${noteId}" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div class="bg-white p-6 rounded-lg w-96">
            <h1 class="text-xl font-semibold mb-2">Edit Note</h1>
            <small class="text-gray-600 block mb-4">Last Edited: ${updatedAt}</small>
            <textarea id="note-text" class="w-full h-32 border border-gray-300 rounded px-3 py-2 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500">${noteText}</textarea>
            <div id="btn-container" class="flex justify-end gap-2">
                <button id="submitBtn" onclick="updateNote()" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Done</button>
                <button id="closeBtn" onclick="closeEditPopup()" class="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
            </div>
        </div>
    </div>
    `;

  document.body.appendChild(editingPopup);

  setTimeout(() => {
    document.getElementById("note-text").focus();
  }, 100);
}

function closeEditPopup() {
  const editingPopup = document.getElementById("editing-container");
  if (editingPopup) {
    editingPopup.remove();
  }
}

function updateNote() {
  const noteText = document.getElementById("note-text").value.trim();
  const editingPopup = document.getElementById("editing-container");

  if (noteText !== "") {
    const noteId = editingPopup.getAttribute("data-note-id");
    let notes = JSON.parse(localStorage.getItem("notes")) || [];

    const updatedNotes = notes.map((note) => {
      if (note.id == noteId) {
        return {
          ...note,
          text: noteText,
          updatedAt: new Date().toISOString(),
        };
      }
      return note;
    });

    localStorage.setItem("notes", JSON.stringify(updatedNotes));
    editingPopup.remove();
    displayNotes();
  }
}

function deleteNote(noteId) {
  if (confirm("Are you sure you want to delete this note?")) {
    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes = notes.filter((note) => note.id !== noteId);

    localStorage.setItem("notes", JSON.stringify(notes));
    displayNotes();
  }
}

// ===============================
// CALENDAR FUNCTIONALITY
// ===============================

function initializeCalendar() {
  setupEventForm();
  setupTaskForm();
  displayEvents();
  displayCalendarTasks();
}

function setupEventForm() {
  const eventForm = document.getElementById("eventForm");
  if (!eventForm) return;

  eventForm.onsubmit = function (e) {
    e.preventDefault();
    addEvent();
  };
}

function setupTaskForm() {
  const addTaskBtn = document.getElementById("addTaskBtn");
  if (!addTaskBtn) return;

  addTaskBtn.onclick = function () {
    addCalendarTask();
  };
}

function addEvent() {
  const eventDate = document.getElementById("eventDate").value;
  const eventTitle = document.getElementById("eventTitle").value.trim();

  if (!eventDate || !eventTitle) {
    alert("Please fill in all fields");
    return;
  }

  const event = {
    id: Date.now(),
    date: eventDate,
    title: eventTitle,
    createdAt: new Date().toISOString(),
  };

  const events = JSON.parse(localStorage.getItem("studentapp-events")) || [];
  events.push(event);
  localStorage.setItem("studentapp-events", JSON.stringify(events));

  // Clear form
  document.getElementById("eventDate").value = "";
  document.getElementById("eventTitle").value = "";

  displayEvents();
}

function displayEvents() {
  const eventList = document.getElementById("eventList");
  if (!eventList) return;

  eventList.innerHTML = "";

  const events = JSON.parse(localStorage.getItem("studentapp-events")) || [];

  // Sort events by date
  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  events.forEach((event) => {
    const eventDate = new Date(event.date);
    const li = document.createElement("li");
    li.className = "flex justify-between items-center bg-blue-50 p-3 rounded";
    li.innerHTML = `
            <div>
                <div class="font-medium">${event.title}</div>
                <div class="text-sm text-gray-600">${eventDate.toLocaleDateString()}</div>
            </div>
            <button onclick="deleteEvent(${
              event.id
            })" class="text-red-500 hover:text-red-700">
                <i class="fas fa-trash text-sm"></i>
            </button>
        `;
    eventList.appendChild(li);
  });
}

function deleteEvent(eventId) {
  if (confirm("Are you sure you want to delete this event?")) {
    const events = JSON.parse(localStorage.getItem("studentapp-events")) || [];
    const filteredEvents = events.filter((e) => e.id !== eventId);
    localStorage.setItem("studentapp-events", JSON.stringify(filteredEvents));
    displayEvents();
  }
}

function addCalendarTask() {
  const taskDate = document.getElementById("taskDate").value;
  const taskInput = document.getElementById("taskInput").value.trim();

  if (!taskDate || !taskInput) {
    alert("Please fill in all fields");
    return;
  }

  const task = {
    id: Date.now(),
    date: taskDate,
    text: taskInput,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  const calendarTasks =
    JSON.parse(localStorage.getItem("studentapp-calendar-tasks")) || [];
  calendarTasks.push(task);
  localStorage.setItem(
    "studentapp-calendar-tasks",
    JSON.stringify(calendarTasks)
  );

  // Clear form
  document.getElementById("taskDate").value = "";
  document.getElementById("taskInput").value = "";

  displayCalendarTasks();
}

function displayCalendarTasks() {
  const taskList = document.getElementById("taskList");
  if (!taskList) return;

  taskList.innerHTML = "";

  const calendarTasks =
    JSON.parse(localStorage.getItem("studentapp-calendar-tasks")) || [];

  // Sort tasks by date
  calendarTasks.sort((a, b) => new Date(a.date) - new Date(b.date));

  calendarTasks.forEach((task) => {
    const taskDate = new Date(task.date);
    const li = document.createElement("li");
    li.className = "flex justify-between items-center bg-green-50 p-3 rounded";
    li.innerHTML = `
            <div class="flex items-center">
                <div class="w-4 h-4 rounded border-2 border-gray-300 flex items-center justify-center cursor-pointer mr-3 ${
                  task.completed ? "bg-green-500 border-green-500" : ""
                }" 
                     onclick="toggleCalendarTask(${task.id})">
                    ${
                      task.completed
                        ? '<i class="fas fa-check text-white text-xs"></i>'
                        : ""
                    }
                </div>
                <div>
                    <div class="font-medium ${
                      task.completed ? "line-through text-gray-500" : ""
                    }">${task.text}</div>
                    <div class="text-sm text-gray-600">${taskDate.toLocaleDateString()}</div>
                </div>
            </div>
            <button onclick="deleteCalendarTask(${
              task.id
            })" class="text-red-500 hover:text-red-700">
                <i class="fas fa-trash text-sm"></i>
            </button>
        `;
    taskList.appendChild(li);
  });
}

function toggleCalendarTask(taskId) {
  const calendarTasks =
    JSON.parse(localStorage.getItem("studentapp-calendar-tasks")) || [];
  const taskIndex = calendarTasks.findIndex((t) => t.id === taskId);

  if (taskIndex !== -1) {
    calendarTasks[taskIndex].completed = !calendarTasks[taskIndex].completed;
    localStorage.setItem(
      "studentapp-calendar-tasks",
      JSON.stringify(calendarTasks)
    );
    displayCalendarTasks();
  }
}

function deleteCalendarTask(taskId) {
  if (confirm("Are you sure you want to delete this task?")) {
    const calendarTasks =
      JSON.parse(localStorage.getItem("studentapp-calendar-tasks")) || [];
    const filteredTasks = calendarTasks.filter((t) => t.id !== taskId);
    localStorage.setItem(
      "studentapp-calendar-tasks",
      JSON.stringify(filteredTasks)
    );
    displayCalendarTasks();
  }
}
