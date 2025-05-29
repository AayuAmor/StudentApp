var setdate = document.querySelector(".set_date");
var settime = document.querySelector(".set_time");

var date = new Date().toDateString();
setdate.innerHTML = date;

setInterval(function () {
  var time = new Date().toLocaleTimeString();
  settime.innerHTML = time;
}, 500);

function checked(id) {
  var checked_green = document.getElementById("check" + id);
  checked_green.classList.toggle('green');

  var strike_unstrike = document.getElementById("strike" + id);
  strike_unstrike.classList.toggle('strike_done');
}

// Dynamically create 7 days starting from Sunday
window.addEventListener('DOMContentLoaded', () => {
  const calendarRow = document.getElementById('calendar-row');
  const today = new Date();
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const currentDayOfWeek = today.getDay();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - currentDayOfWeek);

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
      dateCircle.classList.add(
        'bg-white',
        'text-black',
        'hover:bg-[#063c76]',
        'hover:text-white'
      );
    }

    dayText.textContent = dayName;
    dayColumn.appendChild(dayText);
    dayColumn.appendChild(dateCircle);
    calendarRow.appendChild(dayColumn);
  }

  document.querySelector('.set_date').textContent = today.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  document.querySelector('.set_time').textContent = today.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
});

document.getElementById("add-task-btn").addEventListener("click", () => {
  document.getElementById("task-modal").classList.remove("hidden");
  populateDayDropdown();
});

document.getElementById("cancel-task").addEventListener("click", () => {
  document.getElementById("task-modal").classList.add("hidden");
  document.getElementById("task-title").value = "";
  document.getElementById("task-time").value = "";
});

document.getElementById("save-task").addEventListener("click", () => {
  const title = document.getElementById("task-title").value;
  const date = document.getElementById("task-day").value;
  const time = document.getElementById("task-time").value;

  if (title && date && time) {
    addTask(title, time);
    document.getElementById("task-modal").classList.add("hidden");
  } else {
    alert("Please fill all fields.");
  }
});

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

  // Add the future date selector
  const futureOption = document.createElement('option');
  futureOption.value = "future";
  futureOption.textContent = "Select Future Date...";
  dropdown.appendChild(futureOption);
}

// Handle selecting a future date via prompt
document.getElementById("task-day").addEventListener("change", function () {
  if (this.value === "future") {
    const futureDate = prompt("Enter future date (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);

    if (futureDate) {
      const selectedDate = new Date(futureDate);
      selectedDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate >= today) {
        const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNumber = selectedDate.getDate();

        this.innerHTML = this.innerHTML.replace(
          '<option value="future">Select Future Date...</option>',
          `<option value="${futureDate}">${dayName} ${dayNumber} (Future)</option>
           <option value="future">Select Another Date...</option>`
        );
        this.value = futureDate;
      } else {
        alert("Please select a future date");
        this.value = "";
      }
    } else {
      this.value = "";
    }
  }
});

function addTask(title, time24) {
  const taskId = Date.now();
  const selectedDate = document.getElementById("task-day").value;

  // Convert 24hr to 12hr format
  const [hour, minute] = time24.split(":");
  let hour12 = parseInt(hour, 10);
  const ampm = hour12 >= 12 ? "PM" : "AM";
  hour12 = hour12 % 12 || 12;
  const time12 = `${hour12}:${minute} ${ampm}`;

  // Format date for display
  const dateObj = new Date(selectedDate);
  const weekday = dateObj.toLocaleDateString("en-US", { weekday: "short" });
  const day = dateObj.getDate();
  const month = dateObj.toLocaleDateString("en-US", { month: "short" });
  const formattedDate = `${weekday} ${day} ${month}`;

  const taskHTML = `
    <li class="mt-4" id="${taskId}">
      <div class="flex gap-2">
        <div class="w-7/12 h-12 bg-[#e0ebff] rounded-[7px] flex justify-start items-center px-3">
          <span id="check${taskId}" class="w-7 h-7 bg-white rounded-full border border-white transition-all cursor-pointer hover:border-[#36d344] flex justify-center items-center" onclick="checked(${taskId})"><i class="text-white fa fa-check"></i></span>
          <strike id="strike${taskId}" class="strike_none text-sm ml-4 text-[#5b7a9d] font-semibold">${title}</strike>
        </div>
        <span class="w-1/6 h-12 bg-[#e0ebff] rounded-[7px] flex justify-center text-xs text-[#5b7a9d] font-semibold items-center ">${formattedDate}</span>
        <span class="w-1/6 h-12 bg-[#e0ebff] rounded-[7px] flex justify-center text-xs text-[#5b7a9d] font-semibold items-center ">${time12}</span>
      </div>
    </li>
  `;
  document.getElementById("task-container").insertAdjacentHTML("beforeend", taskHTML);
}


function checked(id) {
  const strike = document.getElementById(`strike${id}`);
  const check = document.getElementById(`check${id}`);
  if (strike.classList.contains("strike_none")) {
    strike.classList.remove("strike_none");
    strike.classList.add("line-through");
    check.classList.add("bg-[#36d344]");
  } else {
    strike.classList.add("strike_none");
    strike.classList.remove("line-through");
    check.classList.remove("bg-[#36d344]");
  }
}
