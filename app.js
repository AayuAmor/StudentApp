/**
 * StudentApp - Unified Study Management Application
 * @author Team Doberman
 * @version 1.0.0
 */

// Global state
let currentSection = 'home';

// Todo list state
let tasks = {};
let draggedItem = null;

// Pomodoro timer state
let workDuration = 25 * 60;
let shortBreak = 5 * 60;
let longBreak = 15 * 60;
let current = workDuration;
let interval = null;
let isRunning = false;
let session = "Work";

/**
 * Navigation system - handles section switching
 */
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Remove active state from nav tabs
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected section
    document.getElementById(sectionName + '-section').classList.add('active');
    event.target.classList.add('active');
    
    // Update global state tracker
    currentSection = sectionName;
    
    // Initialize section-specific functionality
    if (sectionName === 'todo') {
        initializeTodoList();
    } else if (sectionName === 'pomodoro') {
        initializePomodoro();
    } else if (sectionName === 'notes') {
        displayNotes();
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
    document.getElementById('current-time').textContent = timeString;
    document.getElementById('current-date').textContent = dateString;
}

/**
 * Initialize app
 */
document.addEventListener('DOMContentLoaded', function() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    displayNotes();
});

// ===============================
// TODO LIST FUNCTIONALITY
// ===============================

function initializeTodoList() {
    // Generate weekly calendar
    setupWeeklyCalendar();
    // Set up event listeners
    setupTodoEvents();
}

function setupWeeklyCalendar() {
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
        dayText.textContent = dayName;

        const dateCircle = document.createElement('span');
        dateCircle.className = 'h-7 w-7 rounded-full cursor-pointer transition-all flex justify-center items-center text-sm font-semibold';
        dateCircle.innerHTML = `<p>${dayNumber}</p>`;

        // Style based on date
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
    days.forEach(day => {
        const dayName = day.querySelector('span:first-child').textContent;
        const dayNumber = day.querySelector('span:last-child p').textContent;
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

    const futureOption = document.createElement('option');
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

    document.getElementById("task-container").insertAdjacentHTML("beforeend", taskHTML);
    
    tasks[taskId] = {
        title,
        time: time12,
        date: formattedDate,
        completed: false
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
    timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (current / getSessionDuration()) * circumference;
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
        document.getElementById('note-text').focus();
    }, 100);
}

function closePopup() {
    const popupContainer = document.getElementById("popupContainer");
    if (popupContainer) {
        popupContainer.remove();
    }
}

function createNote() {
    const popupContainer = document.getElementById('popupContainer');
    const noteText = document.getElementById('note-text').value;
    if (noteText.trim() !== '') {
        const timestamp = new Date().toISOString();
        const note = {
            id: new Date().getTime(),
            text: noteText,
            createdAt: timestamp,
            updatedAt: timestamp
        };

        const existingNotes = JSON.parse(localStorage.getItem('notes')) || [];
        existingNotes.push(note);

        localStorage.setItem('notes', JSON.stringify(existingNotes));
        popupContainer.remove();
        displayNotes();
    }
}

function displayNotes() {
    const notesList = document.getElementById('notes-list');
    if (!notesList) return;
    
    notesList.innerHTML = '';

    const notes = JSON.parse(localStorage.getItem('notes')) || [];

    notes.forEach(note => {
        const listItem = document.createElement('div');
        listItem.className = 'note-item w-48 h-40 m-2 p-3 bg-yellow-100 border border-yellow-200 rounded-lg shadow-sm relative';
        
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
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const noteToEdit = notes.find(note => note.id == noteId);
    const noteText = noteToEdit ? noteToEdit.text : '';
    const updatedAt = noteToEdit ? new Date(noteToEdit.updatedAt).toLocaleString() : '';

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
        document.getElementById('note-text').focus();
    }, 100);
}

function closeEditPopup() {
    const editingPopup = document.getElementById("editing-container");
    if (editingPopup) {
        editingPopup.remove();
    }
}

function updateNote() {
    const noteText = document.getElementById('note-text').value.trim();
    const editingPopup = document.getElementById('editing-container');

    if (noteText !== '') {
        const noteId = editingPopup.getAttribute('data-note-id');
        let notes = JSON.parse(localStorage.getItem('notes')) || [];

        const updatedNotes = notes.map(note => {
            if (note.id == noteId) {
                return {
                    ...note,
                    text: noteText,
                    updatedAt: new Date().toISOString()
                };
            }
            return note;
        });

        localStorage.setItem('notes', JSON.stringify(updatedNotes));
        editingPopup.remove();
        displayNotes();
    }
}

function deleteNote(noteId) {
    if (confirm('Are you sure you want to delete this note?')) {
        let notes = JSON.parse(localStorage.getItem('notes')) || [];
        notes = notes.filter(note => note.id !== noteId);

        localStorage.setItem('notes', JSON.stringify(notes));
        displayNotes();
    }
}

