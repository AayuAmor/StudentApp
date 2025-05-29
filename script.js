var setdate=document.querySelector(".set_date");
var settime=document.querySelector(".set_time");

var date=new Date().toDateString();
setdate.innerHTML=date;


setInterval(function(){
    var time=new Date().toLocaleTimeString();
    settime.innerHTML=time;
},500);  

// function checked(id){
//     var checked_green=document.getElementById("check"+id);
//     checked_green.classList.toggle('green');
//     var strike_unstrike=document.getElementById("strike"+id);
//     strike_unstrike.classList.toggle('strike_none');
// }
function checked(id) {
  var checked_green = document.getElementById("check" + id);
  checked_green.classList.toggle('green');

  var strike_unstrike = document.getElementById("strike" + id);
  strike_unstrike.classList.toggle('strike_done');
}
// Dynamically create 7 days starting from today
window.addEventListener('DOMContentLoaded', () => {
    const calendarRow = document.getElementById('calendar-row');
    const today = new Date();
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Find the current day of week (0-6 where 0 is Sunday)
    const currentDayOfWeek = today.getDay();
    
    // Calculate the date for Sunday of this week
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - currentDayOfWeek);
    
    // Create 7 days starting from Sunday
    for (let i = 0; i < 7; i++) {
        const date = new Date(sunday);
        date.setDate(sunday.getDate() + i);

        const dayNumber = date.getDate();
        const dayName = weekdayNames[i]; // Use the index since we're starting from Sunday

        // Create a flex column for each day
        const dayColumn = document.createElement('div');
        dayColumn.className = 'flex flex-col items-center space-y-1';

        const dayText = document.createElement('span');
        dayText.className = 'text-sm font-semibold';

        const dateCircle = document.createElement('span');
        dateCircle.className =
            'h-7 w-7 rounded-full cursor-pointer transition-all flex justify-center items-center text-sm font-semibold';

        dateCircle.innerHTML = `<p>${dayNumber}</p>`;

        // Check if it's today
        if (date.toDateString() === today.toDateString()) {
            dayText.classList.add('text-black');
            dateCircle.classList.add('bg-blue-200', 'text-black'); // Changed to blue highlight
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

    // Set header date and time
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
  populateDayDropdown(); // Populate the dropdown every time
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
  const days = document.querySelectorAll("#calendar-row > div");
  dropdown.innerHTML = "";
  days.forEach(day => {
    const value = day.dataset.date || day.innerText;
    dropdown.innerHTML += `<option value="${value}">${day.innerText}</option>`;
  });
}

function addTask(title, time) {
  const taskId = Date.now();
  const taskHTML = `
    <li class="mt-4" id="${taskId}">
      <div class="flex gap-2">
        <div class="w-9/12 h-12 bg-[#e0ebff] rounded-[7px] flex justify-start items-center px-3">
          <span id="check${taskId}" class="w-7 h-7 bg-white rounded-full border border-white transition-all cursor-pointer hover:border-[#36d344] flex justify-center items-center" onclick="checked(${taskId})"><i class="text-white fa fa-check"></i></span>
          <strike id="strike${taskId}" class="strike_none text-sm ml-4 text-[#5b7a9d] font-semibold">${title}</strike>
        </div>
        <span class="w-1/4 h-12 bg-[#e0ebff] rounded-[7px] flex justify-center text-sm text-[#5b7a9d] font-semibold items-center ">${time}</span>
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


