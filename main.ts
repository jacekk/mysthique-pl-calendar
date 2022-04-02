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
let clickedDate: string | null = null;

const addEventModal = document.getElementById('add-event-modal');
const backDrop = document.getElementById('modal-backdrop');
const calendarBody = document.getElementById('calendar-body');
const calendarTitle = document.getElementById('current-month');
const calendarWeekdays = document.getElementById('calendar-weekdays');
const eventModal = document.getElementById('event-modal');
const eventTitleInput = document.getElementById('event-title') as HTMLInputElement;
const monthsModal = document.getElementById('months-modal');
const nextMonthBtn = document.getElementById('next-month-btn') as HTMLButtonElement;
const prevMonthBtn = document.getElementById('previous-month-btn') as HTMLButtonElement;
const yearsModal = document.getElementById('years-modal');

console.log(`Now: ${now.toISOString()}`);

// generating weekdays

function createWeekday(name: string): void {
    calendarWeekdays.appendChild(newElement(name, 'span'));
}

dayNames.forEach(createWeekday);

function generateCurrentMonth(): void {
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
        const dayOfMonth = newElement(String(dayNumber), 'div');
        const eventOfTheDay: EventData | undefined = events.find((e) => e.date === currentDay);

        dayOfMonth.classList.add('month-day');
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

function onNextClick(): void {
    if (currentMonth === 11) {
        currentMonth = 0;
        currentYear += 1;
    } else {
        currentMonth += 1;
    }
    generateCurrentMonth();
}

function onPreviousClick(): void {
    if (currentMonth === 0) {
        currentMonth = 11;
        currentYear -= 1;
    } else {
        currentMonth -= 1;
    }
    generateCurrentMonth();
}

// fill years modal
Array.from(new Array(12))
    .map((_, index) => index + currentYear - 4)
    .forEach(createYearButton);

function createYearButton(year: number): void {
    const button = newElement(String(year), 'button');

    yearsModal.appendChild(button);
    button.classList.add('modal-btn');
    button.addEventListener('click', setYear);
}

function setYear(): void {
    chosenYear = parseInt(this.innerHTML, 10);
    console.log('Chosen year is', chosenYear);
    hide(yearsModal);
    show(monthsModal, 'grid');
}

monthNames.forEach(createMonthButton);

function createMonthButton(month: string): void {
    const button = newElement(month, 'button');
    button.classList.add('modal-btn');
    button.addEventListener('click', setMonth);
    monthsModal.appendChild(button);
}

function setMonth(): void {
    currentMonth = monthNames.indexOf(this.innerHTML);
    currentYear = chosenYear;
    console.log('Chosen month is', currentMonth);
    generateCurrentMonth();
    hide(monthsModal);
    hide(backDrop);
}

calendarTitle.addEventListener('click', chooseDate);

function chooseDate(): void {
    show(yearsModal, 'grid');
    show(backDrop, 'block');
}

backDrop.addEventListener('click', closeModal);

function closeModal(): void {
    document.querySelectorAll<HTMLDivElement>('.modal').forEach((e) => hide(e));
    hide(backDrop);
    generateCurrentMonth();
}

function openEventsModal(): void {
    show(backDrop, 'block');

    clickedDate = new Date(currentYear, currentMonth, this.innerText).toDateString();
    const eventForDay = events.find((e) => e.date === clickedDate);

    if (eventForDay) {
        eventModal.innerHTML = '';
        addCloseButtonToModal(eventModal);
        show(eventModal, 'flex');
        const eventTitle = newElement(eventForDay.title);
        eventModal.appendChild(eventTitle);
        addRemoveButtonToModal(eventModal);
    } else {
        show(addEventModal, 'flex');
    }
}

function submitAddEventModal(): void {
    if (!eventTitleInput.value || eventTitleInput.value.trim().length === 0) {
        return;
    }

    events.push({
        date: clickedDate,
        title: eventTitleInput.value.trim(),
    });
    storeEvents(events);
    eventTitleInput.value = '';
    closeModal();

    console.log('Event added to the calendar');
}

function removeEvent(): void {
    events = events.filter((e) => e.date !== clickedDate);
    storeEvents(events);
    closeModal();
    generateCurrentMonth();

    console.log('Event removed from the calendar');
}

function addCloseButtonToModal(modal: HTMLElement): void {
    modal.innerHTML += `
        <div class="modal-btn close-btn" onclick="closeModal()">
            <i class="fa-solid fa-xmark"></i>
        </div>
    `;
}

function addRemoveButtonToModal(modal: HTMLElement): void {
    modal.innerHTML += `
        <div class="modal-btn" onclick="removeEvent()">
            Delete this event
        </div>
    `;
}

function hide(element: HTMLElement): void {
    element.style.display = 'none';
}

function show(element: HTMLElement, layout: 'block' | 'flex' | 'grid'): void {
    element.style.display = layout;
}

function loadEvents(): EventData[] {
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

function storeEvents(events: EventData[]): void {
    localStorage.setItem(storageKey, JSON.stringify(events));
}

function newElement(textContent: string, type?: keyof HTMLElementTagNameMap): HTMLElement {
    const element = document.createElement(type || 'p');
    const txt = document.createTextNode(textContent);

    element.appendChild(txt);

    return element;
}

type EventData = {
    date: string;
    title: string;
};
