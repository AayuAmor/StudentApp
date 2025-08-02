/**
 * StudentApp - Unified Study Management Application
 * @author Team Doberman
 * @version 1.0.0
 */

// Global state
let currentSection = 'home';

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
    
    currentSection = sectionName;
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

