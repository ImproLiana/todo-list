
const aside = document.createElement("aside")
const main = document.createElement("main")
const heading = document.createElement("h1")
const navigation = document.createElement("nav")
const ul = document.createElement("ul")

aside.id = "sidebar"
main.id = "app-main"
navigation.id = "sidebar-nav"
ul.id = "task-list"

document.body.appendChild(aside)
document.body.appendChild(main)
main.appendChild(heading)
heading.textContent = "Сегодня"
aside.appendChild(navigation)
main.appendChild(ul)

makeButton("Все дела", navigation)
const todayBtn = makeButton("Сегодня", navigation)
makeButton("Ближайшая неделя", navigation)
makeButton("Просроченные", navigation)
makeButton("Завершённые", navigation)
todayBtn.classList.add("nav-active")

function makeButton(text, parent, id) {
    const button = document.createElement("button")
    button.textContent = text
    parent.appendChild(button)
    if (id) {
        button.id = id
    }
    button.type = "button"
    return button
}

const tasks = [
    {
        id: 1,
        title: "Have a walk",
        date: "2026-11-05",
        time: "10:00",
        note: "with my dog",
        priority: "2",
        completed: false,
        order: 0
    },
    {
        id: 2,
        title: "Make breakfast",
        date: "2026-11-05",
        time: "13:00",
        note: "",
        priority: "1",
        completed: false,
        order: 2
    },
    {
        id: 3,
        title: "Read a book",
        date: "",
        time: "",
        note: "",
        priority: "0",
        completed: false,
        order: 1
    }
]

function addLi(text, parent, id) {
    const li = document.createElement("li")
    const div = document.createElement("div")
    const titleParagraph = document.createElement("p")

    li.classList.add("task-item")
    div.classList.add("task-content")
    titleParagraph.classList.add("task-title")

    parent.appendChild(li)
    li.appendChild(div)
    div.appendChild(titleParagraph)

    titleParagraph.textContent = text
    div.id = `task-div${id}`
    li.id = `task-li${id}`

    return div
}

function addTask(title, date, time, note, priority, id, parent) {
    if (priority === "1") {
        title = "❗ " + title
    } else if (priority === "2") {
        title = "‼️ " + title
    }

    const div = addLi(title, parent, id)

    if (note) {
        const paragraph = document.createElement("p")
        paragraph.textContent = note
        paragraph.classList.add("task-note")
        div.appendChild(paragraph)
    }

    if (date || time) {
        const paragraph = document.createElement("p")
        paragraph.classList.add("task-meta")

        const readableDate = date
            ? new Date(`${date}T00:00:00`).toLocaleDateString("ru-RU")
            : ""

        paragraph.textContent = [readableDate, time]
            .filter(Boolean)
            .join(", ")

        div.appendChild(paragraph)
    }
}

function updateTasks(tasks) {
    ul.replaceChildren()

    const sortedTasks = [...tasks].sort((a, b) => a.order - b.order)

    for (const task of sortedTasks) {
        addTask(
            task.title,
            task.date,
            task.time,
            task.note,
            task.priority,
            task.id,
            ul
        )
    }
}

updateTasks(tasks)

const addBtn = makeButton("+", main, "add-task-button")

const formDiv = document.createElement("div")
formDiv.id = "quick-add-wrap"
main.appendChild(formDiv)

const formNewTask = document.createElement("form")
formNewTask.id = "quick-add-form"
formDiv.appendChild(formNewTask)

const titleInput = document.createElement("input")
titleInput.id = "task-title-input"
titleInput.value = "Задача"

const noteInput = document.createElement("textarea")
noteInput.id = "task-note-input"
noteInput.placeholder = "Добавить заметку"

const formPriorityBtn = makeButton("⚑", formNewTask, "priority-button")
formPriorityBtn.classList.add("0")

const dateTimeButton = makeButton("▦", formNewTask, "date-time-button")

formNewTask.appendChild(titleInput)
formNewTask.appendChild(noteInput)

const saveTaskButton = makeButton("✓", formNewTask, "save-task-button")

const dateTimeDiv = document.createElement("div")
dateTimeDiv.id = "date-time-popup"
formNewTask.appendChild(dateTimeDiv)

const popupTitle = document.createElement("h3")
popupTitle.id = "calendar-popup-title"
popupTitle.textContent = "Дата и время"
dateTimeDiv.appendChild(popupTitle)

const closeDateTime = makeButton("×", dateTimeDiv, "close-date-time")
const calendarDone = makeButton("✓", dateTimeDiv, "calendar-done")

const dateButton = makeButton(
    "Выбрать дату",
    dateTimeDiv,
    "date-choice-button"
)

const calendarPanel = document.createElement("div")
calendarPanel.classList.add("calendar-panel")
dateTimeDiv.appendChild(calendarPanel)

const calendarHeader = document.createElement("div")
calendarHeader.classList.add("calendar-header")
calendarPanel.appendChild(calendarHeader)

const prevMonth = makeButton("‹", calendarHeader)

const monthTitle = document.createElement("span")
calendarHeader.appendChild(monthTitle)

const nextMonth = makeButton("›", calendarHeader)

const weekdays = document.createElement("div")
weekdays.classList.add("calendar-weekdays")
calendarPanel.appendChild(weekdays)

for (const day of ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"]) {
    const label = document.createElement("span")
    label.textContent = day
    weekdays.appendChild(label)
}

const daysGrid = document.createElement("div")
daysGrid.classList.add("calendar-days")
calendarPanel.appendChild(daysGrid)

const clearDate = makeButton(
    "Убрать дату",
    calendarPanel,
    "clear-calendar-date"
)

const timeButton = makeButton(
    "Выбрать время",
    dateTimeDiv,
    "time-choice-button"
)

const timePanel = document.createElement("div")
timePanel.classList.add("ios-time-panel")
dateTimeDiv.appendChild(timePanel)

const timeLabel = document.createElement("label")
timeLabel.classList.add("custom-time-label")
timeLabel.textContent = "Время, ЧЧ:ММ"
timePanel.appendChild(timeLabel)

const customTimeInput = document.createElement("input")
customTimeInput.id = "custom-time-input"
customTimeInput.type = "text"
customTimeInput.inputMode = "numeric"
customTimeInput.maxLength = 5
customTimeInput.placeholder = "Например, 14:35"
timePanel.appendChild(customTimeInput)

const clearTime = makeButton(
    "Убрать время",
    timePanel,
    "clear-calendar-time"
)

let selectedDate = ""
let selectedTime = ""

let displayedMonth = new Date()

displayedMonth = new Date(
    displayedMonth.getFullYear(),
    displayedMonth.getMonth(),
    1
)

function padCalendarNumber(number) {
    return String(number).padStart(2, "0")
}

function renderCalendar() {
    daysGrid.replaceChildren()

    const year = displayedMonth.getFullYear()
    const month = displayedMonth.getMonth()

    const monthText = displayedMonth.toLocaleDateString("ru-RU", {
        month: "long",
        year: "numeric"
    })

    monthTitle.textContent =
        monthText[0].toUpperCase() + monthText.slice(1)

    const daysCount = new Date(year, month + 1, 0).getDate()

    const firstWeekday =
        (new Date(year, month, 1).getDay() + 6) % 7

    const today = new Date()

    for (let i = 0; i < firstWeekday; i++) {
        daysGrid.appendChild(document.createElement("span"))
    }

    for (let day = 1; day <= daysCount; day++) {
        const dayButton = makeButton(String(day), daysGrid)
        dayButton.classList.add("calendar-day")

        const date = `${year}-${padCalendarNumber(month + 1)}-${padCalendarNumber(day)}`

        if (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        ) {
            dayButton.classList.add("calendar-today")
        }

        if (date === selectedDate) {
            dayButton.classList.add("calendar-selected")
        }

        dayButton.addEventListener("click", () => {
            selectedDate = date

            dateButton.textContent =
                new Date(year, month, day).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                })

            renderCalendar()
        })
    }
}

prevMonth.addEventListener("click", () => {
    displayedMonth.setMonth(displayedMonth.getMonth() - 1)
    renderCalendar()
})

nextMonth.addEventListener("click", () => {
    displayedMonth.setMonth(displayedMonth.getMonth() + 1)
    renderCalendar()
})

clearDate.addEventListener("click", () => {
    selectedDate = ""
    dateButton.textContent = "Выбрать дату"
    renderCalendar()
})

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/

customTimeInput.addEventListener("input", () => {
    const value = customTimeInput.value.trim()

    if (!value) {
        selectedTime = ""
        timeButton.textContent = "Выбрать время"
        customTimeInput.removeAttribute("aria-invalid")
        return
    }

    const valid = timePattern.test(value)

    customTimeInput.setAttribute("aria-invalid", String(!valid))

    selectedTime = valid ? value : ""

    timeButton.textContent = valid
        ? `Время: ${value}`
        : "Выбрать время"
})

clearTime.addEventListener("click", () => {
    selectedTime = ""
    customTimeInput.value = ""
    customTimeInput.removeAttribute("aria-invalid")
    timeButton.textContent = "Выбрать время"
})

timeButton.addEventListener("click", () => {
    customTimeInput.focus()
})

function positionCalendarPopup() {
    const anchor = dateTimeButton.getBoundingClientRect()
    const popup = dateTimeDiv.getBoundingClientRect()

    const left = Math.max(
        12,
        Math.min(
            anchor.right + 20,
            window.innerWidth - popup.width - 12
        )
    )

    const top = Math.max(
        12,
        Math.min(
            anchor.top - 65,
            window.innerHeight - popup.height - 12
        )
    )

    dateTimeDiv.style.left = `${left}px`
    dateTimeDiv.style.top = `${top}px`

    const arrowTop = Math.max(
        18,
        Math.min(
            anchor.top + anchor.height / 2 - top - 7,
            popup.height - 34
        )
    )

    dateTimeDiv.style.setProperty("--arrow-top", `${arrowTop}px`)
}

function openCalendarPopup() {
    dateTimeDiv.style.display = "block"
    calendarPanel.style.display = "block"
    timePanel.style.display = "block"

    renderCalendar()
    positionCalendarPopup()
}

dateTimeButton.addEventListener("click", () => {
    if (dateTimeDiv.style.display === "block") {
        dateTimeDiv.style.display = "none"
    } else {
        openCalendarPopup()
    }
})

closeDateTime.addEventListener("click", () => {
    dateTimeDiv.style.display = "none"
})

calendarDone.addEventListener("click", () => {
    dateTimeDiv.style.display = "none"
})

dateTimeDiv.addEventListener("click", (event) => {
    event.stopPropagation()
})

function hideForm() {
    formDiv.style.display = "none"

    titleInput.value = "Задача"
    noteInput.value = ""

    selectedDate = ""
    selectedTime = ""

    dateButton.textContent = "Выбрать дату"
    timeButton.textContent = "Выбрать время"

    customTimeInput.value = ""
    customTimeInput.removeAttribute("aria-invalid")

    formPriorityBtn.classList.remove(formPriorityBtn.classList[0])
    formPriorityBtn.classList.add("0")

    dateTimeDiv.style.display = "none"
}

formDiv.style.display = "none"
dateTimeDiv.style.display = "none"

addBtn.addEventListener("click", () => {
    formDiv.style.display = "block"
    titleInput.focus()
    titleInput.select()
})

titleInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault()
    }
})

saveTaskButton.addEventListener("click", () => {
    formNewTask.requestSubmit()
})

document.addEventListener("click", (event) => {
    if (formDiv.style.display !== "block") {
        return
    }

    if (
        formDiv.contains(event.target) ||
        addBtn.contains(event.target)
    ) {
        return
    }

    if (titleInput.value) {
        formNewTask.requestSubmit()
    }
})

formNewTask.addEventListener("submit", (event) => {
    event.preventDefault()

    if (!titleInput.value) {
        return
    }

    if (
        customTimeInput.value.trim() &&
        !timePattern.test(customTimeInput.value.trim())
    ) {
        customTimeInput.focus()
        return
    }

    let id = 1
    let order = 0

    if (tasks.length > 0) {
        id = Math.max(...tasks.map(task => task.id)) + 1
        order = Math.max(...tasks.map(task => task.order)) + 1
    }

    tasks.push({
        id: id,
        title: titleInput.value,
        date: selectedDate,
        time: selectedTime,
        note: noteInput.value,
        priority: formPriorityBtn.classList[0],
        order: order,
        completed: false
    })

    updateTasks(tasks)
    hideForm()
})

formPriorityBtn.addEventListener("click", () => {
    const prior = formPriorityBtn.classList[0]

    formPriorityBtn.classList.remove(prior)

    formPriorityBtn.classList.add(
        String((Number(prior) + 1) % 3)
    )
})

main.addEventListener("scroll", () => {
    if (dateTimeDiv.style.display === "block") {
        positionCalendarPopup()
    }
})

window.addEventListener("resize", () => {
    if (dateTimeDiv.style.display === "block") {
        positionCalendarPopup()
    }
})

renderCalendar()
