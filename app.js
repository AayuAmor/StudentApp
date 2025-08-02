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
    }
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
    if (addTaskBtn) {
        addTaskBtn.addEventListener("click", () => {
            document.getElementById("task-modal").classList.remove("hidden");
            populateDayDropdown();
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

