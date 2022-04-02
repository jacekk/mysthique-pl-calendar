const now = new Date();
const bellIcon = '<i class="fa-solid fa-bell day-icon"></i>';
const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Satruday', 'Sunday'];
const storageKey = 'events';
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

let currentYear = now.getFullYear();
let currentMonth = now.getMonth();
let currentDay = now.getDate();
let events = loadEvents();
let chosenYear = currentYear;
let clickedDate = '';

const addEventModal = document.getElementById('add-event-modal');
const backDrop = document.getElementById('modal-backdrop');
const calendarBody = document.getElementById('calendar-body');
const calendarTitle = document.getElementById('current-month');
const calendarWeekdays = document.getElementById('calendar-weekdays');
const eventModal = document.getElementById('event-modal');
const eventTitleInput = document.getElementById('event-title');
const monthsModal = document.getElementById('months-modal');
const nextMonthBtn = document.getElementById('next-month-btn');
const prevMonthBtn = document.getElementById('previous-month-btn');
const yearsModal = document.getElementById('years-modal');

console.log(`Now: ${now.toISOString()}`);

// generating weekdays

function createWeekday(name) {
    calendarWeekdays.appendChild(newElement(name, 'span'));
}

dayNames.forEach(createWeekday);

function generateCurrentMonth() {
    const currentMonthName = monthNames[currentMonth];
    let firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    console.log('Showing now:', currentMonthName, currentYear);

    // clear days of the previously rendered month
    calendarBody.innerHTML = '';
    calendarTitle.innerHTML = `${currentMonthName} ${currentYear}`;

    // generate empty days
    if (firstDayOfMonth === 0) {
        firstDayOfMonth = 7;
    }
    for (let i = 0; i < firstDayOfMonth - 1; i++) {
        calendarBody.appendChild(newElement('', 'div'));
    }

    // generate days of the month
    const numberOfDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let dayNumber = 1; dayNumber <= numberOfDays; dayNumber++) {
        const currentDay = new Date(currentYear, currentMonth, dayNumber).toDateString();

        dayOfMonth = newElement(dayNumber, 'div');
        dayOfMonth.classList.add('month-day');

        const eventOfTheDay = events.find((e) => e.date === currentDay);
        if (eventOfTheDay) {
            dayOfMonth.innerHTML += bellIcon;
        }
        calendarBody.appendChild(dayOfMonth);
        dayOfMonth.addEventListener('click', openEventsModal);
    }
}

generateCurrentMonth(); // as a starter

// navigate through months
nextMonthBtn.addEventListener('click', onNextClick);
prevMonthBtn.addEventListener('click', onPreviousClick);

function onNextClick() {
    if (currentMonth === 11) {
        currentMonth = 0;
        currentYear += 1;
    } else {
        currentMonth += 1;
    }
    generateCurrentMonth();
}

function onPreviousClick() {
    if (currentMonth === 0) {
        currentMonth = 11;
        currentYear -= 1;
    } else {
        currentMonth -= 1;
    }
    generateCurrentMonth();
}

// open calendar menu
const yearsList = [];
yearsList[0] = currentYear - 4;
yearsList[1] = currentYear - 3;
yearsList[2] = currentYear - 2;
yearsList[3] = currentYear - 1;
yearsList[4] = currentYear;
yearsList[5] = currentYear + 1;
yearsList[6] = currentYear + 2;
yearsList[7] = currentYear + 3;
yearsList[8] = currentYear + 4;
yearsList[9] = currentYear + 5;
yearsList[10] = currentYear + 6;
yearsList[11] = currentYear + 7;

yearsList.forEach(createYearButton);

function createYearButton(year) {
    const button = newElement(year, 'button');

    yearsModal.appendChild(button);
    button.classList.add('modal-btn');
    button.addEventListener('click', setYear);
}

function setYear() {
    chosenYear = parseInt(this.innerHTML, 10);
    console.log('Current year is', chosenYear);
    hide(yearsModal);
    show(monthsModal, 'grid');
}

monthNames.forEach(createMonthButton);

function createMonthButton(month) {
    const button = newElement(month, 'button');
    button.classList.add('modal-btn');
    button.addEventListener('click', setMonth);
    monthsModal.appendChild(button);
}

function setMonth() {
    currentMonth = monthNames.indexOf(this.innerHTML);
    currentYear = chosenYear;
    console.log('Current month is', currentMonth);
    generateCurrentMonth();
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
    generateCurrentMonth();
}

function openEventsModal() {
    show(backDrop, 'block');

    clickedDate = new Date(currentYear, currentMonth, this.innerText).toDateString();
    const eventForDay = events.find((e) => e.date === clickedDate);

    if (eventForDay) {
        eventModal.innerHTML = '';
        addCloseButtonToModal(eventModal);
        show(eventModal, 'flex');
        const eventTitle = newElement(eventForDay.title, 'p');
        eventModal.appendChild(eventTitle);
        addRemoveButtonToModal(eventModal);
    } else {
        show(addEventModal, 'flex');
    }
}

function submitAddEventModal() {
    if (!eventTitleInput.value) {
        return;
    }

    events.push({
        date: clickedDate,
        title: eventTitleInput.value,
    });
    storeEvents(events);
    eventTitleInput.value = '';
    closeModal();

    console.log('Event added to the calendar');
}

function removeEvent() {
    events = events.filter((e) => e.date !== clickedDate);
    storeEvents(events);
    closeModal();
    generateCurrentMonth();

    console.log('Event removed from the calendar');
}

function addCloseButtonToModal(modal) {
    modal.innerHTML += `
        <div class="modal-btn close-btn" onclick="closeModal()">
            <i class="fa-solid fa-xmark"></i>
        </div>
    `;
}

function addRemoveButtonToModal(modal) {
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

function loadEvents() {
    try {
        const loaded = localStorage.getItem(storageKey);
        const parsed = JSON.parse(loaded);

        if (Array.isArray(parsed)) {
            return parsed;
        }

        throw new Error('Stored events are not valid!');
    } catch (err) {
        console.error(err);
    }
    return [];
}

function storeEvents(events) {
    localStorage.setItem(storageKey, JSON.stringify(events));
}

function newElement(textContent, type) {
    const element = document.createElement(type || 'p');
    const txt = document.createTextNode(textContent);

    element.appendChild(txt);

    return element;
}
