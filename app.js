/**
 * StudentApp - Unified Study Management Application
 * @author Team Doberman
 * @version 1.0.0
 */

// Global application state
let currentSection = 'home';

/**
 * Handles section switching between different app modules
 */
function showSection(sectionName) {
    // Hide all content sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Reset navigation tabs
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected section
    document.getElementById(sectionName + '-section').classList.add('active');
    event.target.classList.add('active');
    
    currentSection = sectionName;
}

/**
 * Updates real-time date and time display
 */
function updateDateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toDateString();
    
    document.getElementById('current-time').textContent = timeString;
    document.getElementById('current-date').textContent = dateString;
}

// ===============================
// TODO LIST FUNCTIONALITY
// ===============================

// Task storage and drag-drop state
let tasks = {};
let draggedItem = null;

/**
 * Initializes todo list with calendar view and event handlers
 */
function initializeTodoList() {
    // Generate weekly calendar
    const calendarRow = document.getElementById('calendar-row');
    if (!calendarRow) return;
    
    const today = new Date();
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDayOfWeek = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - currentDayOfWeek);

    calendarRow.innerHTML = '';

    for (let i = 0; i < 7; i++) {
        const date = new Date(sunday);
        date.setDate(sunday.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        const dayNumber = date.getDate();
        const dayName = weekdayNames[i];

        const dayColumn = document.createElement('div');
        dayColumn.className = 'flex flex-col items-center space-y-1';
        dayColumn.dataset.date = dateString;

        const dayText = document.createElement('span');
        dayText.className = 'text-sm font-semibold';
        const dateCircle = document.createElement('span');
        dateCircle.className = 'h-7 w-7 rounded-full cursor-pointer transition-all flex justify-center items-center text-sm font-semibold';
        dateCircle.innerHTML = `<p>${dayNumber}</p>`;

        if (date.toDateString() === today.toDateString()) {
            dayText.classList.add('text-black');
            dateCircle.classList.add('bg-blue-200', 'text-black');
        } else if (date < today) {
            dayText.classList.add('text-gray-400');
            dateCircle.classList.add('bg-gray-100', 'text-gray-500');
        } else {
            dayText.classList.add('text-[#5b7a9d]');
            dateCircle.classList.add('bg-white', 'text-black', 'hover:bg-[#063c76]', 'hover:text-white');
        }

        dayText.textContent = dayName;
        dayColumn.appendChild(dayText);
        dayColumn.appendChild(dateCircle);
        calendarRow.appendChild(dayColumn);
    }

    setupTodoEvents();
}

/**
 * Sets up event listeners for todo modal interactions
 */
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
            clearTaskForm();
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

            addTask(title, time);
            document.getElementById("task-modal").classList.add("hidden");
            clearTaskForm();
        });
    }
}

/**
 * Clears task form inputs
 */
function clearTaskForm() {
    document.getElementById("task-title").value = "";
    document.getElementById("task-time").value = "";
}

/**
 * Populates day dropdown with current week dates
 */
function populateDayDropdown() {
    const dropdown = document.getElementById("task-day");
    const today = new Date();
    dropdown.innerHTML = "";

    const days = document.querySelectorAll("#calendar-row > div");
    days.forEach(day => {
        const dayName = day.querySelector('span:first-child').textContent;
        const dayNumber = day.querySelector('span:last-child p').textContent;
        const dateStr = day.dataset.date;

        if (dateStr) {
            const dayDate = new Date(dateStr);
            if (dayDate >= today) {
                dropdown.innerHTML += `<option value="${dateStr}">${dayName} ${dayNumber}</option>`;
            }
        }
    });
}

/**
 * Creates new task with formatted display
 */
function addTask(title, time24) {
    const taskId = Date.now();
    const selectedDate = document.getElementById("task-day").value;

    // Convert 24-hour to 12-hour format
    const [hour, minute] = time24.split(":");
    let hour12 = parseInt(hour, 10);
    const ampm = hour12 >= 12 ? "PM" : "AM";
    hour12 = hour12 % 12 || 12;
    const time12 = `${hour12}:${minute} ${ampm}`;

    // Format date display
    const dateObj = new Date(selectedDate);
    const weekday = dateObj.toLocaleDateString("en-US", { weekday: "short" });
    const day = dateObj.getDate();
    const month = dateObj.toLocaleDateString("en-US", { month: "short" });
    const formattedDate = `${weekday} ${day} ${month}`;

    const taskHTML = `
        <li class="mt-4" id="${taskId}" draggable="true" ondragstart="drag(event)">
            <div class="flex gap-2">
                <div class="w-7/12 h-12 bg-[#e0ebff] rounded-[7px] flex items-center px-3">
                    <span id="check${taskId}" class="w-7 h-7 bg-white rounded-full border cursor-pointer hover:border-[#36d344] flex justify-center items-center" onclick="toggleTask(${taskId})">
                        <i class="text-white fa fa-check"></i>
                    </span>
                    <strike id="strike${taskId}" class="strike_none text-sm ml-4 text-[#5b7a9d] font-semibold">${title}</strike>
                </div>
                <span class="w-1/6 h-12 bg-[#e0ebff] rounded-[7px] flex justify-center items-center text-xs text-[#5b7a9d] font-semibold">${formattedDate}</span>
                <span class="w-1/6 h-12 bg-[#e0ebff] rounded-[7px] flex justify-center items-center text-xs text-[#5b7a9d] font-semibold">${time12}</span>
            </div>
        </li>
    `;

    document.getElementById("task-container").insertAdjacentHTML("beforeend", taskHTML);
    tasks[taskId] = { title, time: time12, date: formattedDate, completed: false };
}

/**
 * Toggles task completion state
 */
function toggleTask(id) {
    const strike = document.getElementById(`strike${id}`);
    const check = document.getElementById(`check${id}`);

    strike.classList.toggle("strike_none");
    strike.classList.toggle("line-through");
    check.classList.toggle("bg-[#36d344]");

    if (tasks[id]) {
        tasks[id].completed = !tasks[id].completed;
    }
}

/**
 * Handles drag start for task reordering
 */
function drag(event) {
    draggedItem = event.target;
    event.target.classList.add("dragging");
}

// Initialize app when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    initializeTodoList();
});
