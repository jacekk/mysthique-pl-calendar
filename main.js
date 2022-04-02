const today = new Date();
let year = today.getFullYear();
let month = today.getMonth();
let day = today.getDate();
let events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];
let chosenYear = '';
let clicked = '';

const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Satruday'];
const calendarTitle = document.getElementById('this-month');
const calendar = document.getElementById('calendar');
const yearsModal = document.getElementById('years');
const monthsModal = document.getElementById('months');
const eventModal = document.getElementById('eventModal');
const addEvent = document.getElementById('addEventModal');
const input = document.getElementById('eventTitle');
const backDrop = document.getElementById('modalBackDrop');

console.log(today);

//generating actual month

function generateCalendar() {
    let firstDayOfMonth = new Date(year, month, 1).getDay();
    console.log('Showing now: ' + monthNames[month] + ' ' + year);

    // clear days of the previous month
    calendar.innerHTML = '';

    calendarTitle.innerHTML = monthNames[month] + ' ' + year;

    //generate empty days
    if (firstDayOfMonth == 0) {
        firstDayOfMonth = 7;
    }
    for (let i = 0; i < firstDayOfMonth - 1; i++) {
        let emptyDay = document.createElement('div');
        calendar.appendChild(emptyDay);
    }
    //generate days of the month
    let numberOfDays = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= numberOfDays; day++) {
        let dayOfMonth = document.createElement('div');
        let innerTxt = document.createTextNode(day);
        let thisDay = new Date(year, month, day).toDateString();

        dayOfMonth.appendChild(innerTxt);
        dayOfMonth.classList.add('day');
        let eventOfTheDay = events.find((e) => e.date === thisDay);
        if (eventOfTheDay) {
            dayOfMonth.innerHTML += '<i class="fa-solid fa-bell icon"></i>';
        }
        calendar.appendChild(dayOfMonth);
        dayOfMonth.addEventListener('click', openEventsModal);
    }
}

generateCalendar(); // generate actual month as starter

// navigate through months
const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('previous');
nextBtn.addEventListener('click', next);
prevBtn.addEventListener('click', previous);

function next() {
    if (month == 11) {
        month = 0;
        year += 1;
    } else {
        month += 1;
    }
    generateCalendar();
}

function previous() {
    if (month == 0) {
        month = 11;
        year -= 1;
    } else {
        month -= 1;
    }
    generateCalendar();
}

// open calendar menu
const yearsList = [];
yearsList[0] = year - 4;
yearsList[1] = year - 3;
yearsList[2] = year - 2;
yearsList[3] = year - 1;
yearsList[4] = year;
yearsList[5] = year + 1;
yearsList[6] = year + 2;
yearsList[7] = year + 3;
yearsList[8] = year + 4;
yearsList[9] = year + 5;
yearsList[10] = year + 6;
yearsList[11] = year + 7;

yearsList.forEach(createYearButton);

function createYearButton(year) {
    let button = document.createElement('button');
    let innerTxt = document.createTextNode(year);
    button.appendChild(innerTxt);
    yearsModal.appendChild(button);
    button.className = 'modal-btn';
    button.addEventListener('click', setYear);
}

function setYear() {
    chosenYear = this.innerHTML;
    console.log('Chosen year is ' + chosenYear);
    hide(yearsModal);
    show(monthsModal, 'grid');
}

monthNames.forEach(createMonthButton);

function createMonthButton(month) {
    let button = document.createElement('button');
    let innerTxt = document.createTextNode(month);
    button.appendChild(innerTxt);
    monthsModal.appendChild(button);
    button.className = 'modal-btn';
    button.addEventListener('click', setMonth);
}

function setMonth() {
    month = monthNames.indexOf(this.innerHTML);
    year = parseInt(chosenYear);
    console.log('Chosen month is ' + month);
    generateCalendar();
    hide(monthsModal);
    hide(backDrop);
}

calendarTitle.addEventListener('click', chooseDate);

function chooseDate() {
    show(yearsModal, 'grid');
    show(backDrop, 'block');
}

backDrop.addEventListener('click', closeModal);

function closeModal() {
    document.querySelectorAll('.modal').forEach((e) => hide(e));
    hide(backDrop);
    generateCalendar();
}

function openEventsModal() {
    backDrop.style.display = 'block';
    clicked = new Date(year, month, this.innerText).toDateString();
    const eventForDay = events.find((e) => e.date === clicked);
    if (eventForDay) {
        eventModal.innerHTML = '';
        addCloseButton(eventModal);
        show(eventModal, 'flex');
        let event = document.createElement('p');
        let txt = document.createTextNode(eventForDay.title);
        event.appendChild(txt);
        eventModal.appendChild(event);
        addRemoveButton(eventModal);
    } else {
        show(addEvent, 'flex');
    }
}

function addNewEvent() {
    if (input.value) {
        events.push({
            date: clicked,
            title: input.value,
        });
        localStorage.setItem('events', JSON.stringify(events));
        input.value = '';
        closeModal();
    }
    console.log('Event added to the calendar');
}

function removeEvent() {
    events = events.filter((e) => e.date !== clicked);
    localStorage.setItem('events', JSON.stringify(events));
    closeModal();
    generateCalendar();
}

function addCloseButton(modal) {
    modal.innerHTML += `
        <div class="closeBtn" onclick="closeModal()">
            <i class="fa-solid fa-xmark"></i>
        </div>
    `;
}

function addRemoveButton(modal) {
    modal.innerHTML += `
        <div class="modal-btn" onclick="removeEvent()">
            Delete this event
        </div>
    `;
}

function hide(element) {
    element.style.display = 'none';
}

function show(element, layout) {
    element.style.display = layout;
}
