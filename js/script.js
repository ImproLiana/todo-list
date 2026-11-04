
const aside = document.createElement("aside")
const main = document.createElement("main")
const heading = document.createElement("h1")
const navigation = document.createElement("nav")
const ul = document.createElement("ul")
let editingId = null

document.title = "To-Do List"


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

const tasks = JSON.parse(localStorage.getItem("tasks")) ?? []

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

    return [li, div]
}

function addTask(title, date, time, note, priority, id, completed, parent) {
    if (priority === "1") {
        title = "❗ " + title
    } else if (priority === "2") {
        title = "‼️ " + title
    }

    const [li, div] = addLi(title, parent, id)

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

    const deleteBtn = makeButton('🗑️', div, id)
    deleteBtn.classList.add("delete-task-button")
    deleteBtn.addEventListener("click", (event) => {
        const index = tasks.findIndex(task => task.id === id)
        if (index !== -1){
            tasks.splice(index, 1)
            updateTasks(tasks)
        }
        event.stopPropagation()
    })

    const completedBtn = makeButton('', div)
    completedBtn.classList.add("completed-button")

    if(completed) {
        li.classList.add("completed")
    } 

    completedBtn.addEventListener("click", (event) => {
        const index = tasks.findIndex(task => task.id === id)
        if (index !== -1){
            tasks[index].completed = !tasks[index].completed
            li.classList.toggle("completed", tasks[index].completed)
            localStorage.setItem("tasks", JSON.stringify(tasks))
        }
        event.stopPropagation()
    })

    li.addEventListener("click", (event) => {
    event.stopPropagation()

    if (editingId === id) return

    if (formDiv.style.display === "block") {
        formNewTask.requestSubmit()
        if (formDiv.style.display === "block") return
    }

    editingId = id

    const task = tasks.find(task => task.id === id)
    const currentLi = document.getElementById(`task-li${id}`)

    if (task && currentLi) {
        showForm(task, currentLi)
    }
})

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
            task.completed,
            ul
        )
    }
    localStorage.setItem("tasks", JSON.stringify(tasks))
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
function changeTime(delta) {
    let value = customTimeInput.value.trim()

    if (!timePattern.test(value)) {
        value = selectedTime
    }

    if (!timePattern.test(value)) {
        value = "09:00"
    }

    const [hours, minutes] = value.split(":").map(Number)
    const total = (hours * 60 + minutes + delta + 1440) % 1440

    const newHours = padCalendarNumber(Math.floor(total / 60))
    const newMinutes = padCalendarNumber(total % 60)

    hourInput.value = newHours
    minuteInput.value = newMinutes
    customTimeInput.value = `${newHours}:${newMinutes}`

    customTimeInput.dispatchEvent(new Event("input"))
}

timePanel.classList.add("ios-time-panel")
dateTimeDiv.appendChild(timePanel)

const timeLabel = document.createElement("label")
timeLabel.classList.add("custom-time-label")
timeLabel.textContent = "Время, ЧЧ:ММ"
timePanel.appendChild(timeLabel)

const timeControls = document.createElement("div")
timeControls.classList.add("time-controls")
timePanel.appendChild(timeControls)

const minusHour = makeButton("−", timeControls)

const hourInput = document.createElement("input")
hourInput.classList.add("time-part-input")
hourInput.type = "text"
hourInput.inputMode = "numeric"
hourInput.maxLength = 2
hourInput.placeholder = "09"
timeControls.appendChild(hourInput)

const plusHour = makeButton("+", timeControls)

const colon = document.createElement("span")
colon.textContent = ":"
timeControls.appendChild(colon)

const minusMinute = makeButton("−", timeControls)

const minuteInput = document.createElement("input")
minuteInput.classList.add("time-part-input")
minuteInput.type = "text"
minuteInput.inputMode = "numeric"
minuteInput.maxLength = 2
minuteInput.placeholder = "00"
timeControls.appendChild(minuteInput)

const plusMinute = makeButton("+", timeControls)

const customTimeInput = document.createElement("input")
customTimeInput.id = "custom-time-input"
customTimeInput.type = "hidden"
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
function syncTimeInput() {
    const hours = hourInput.value.trim()
    const minutes = minuteInput.value.trim()

    customTimeInput.value = !hours && !minutes
        ? ""
        : `${hours ? hours.padStart(2, "0") : ""}:${minutes ? minutes.padStart(2, "0") : ""}`

    customTimeInput.dispatchEvent(new Event("input"))
}

hourInput.addEventListener("input", syncTimeInput)
minuteInput.addEventListener("input", syncTimeInput)

for (const input of [hourInput, minuteInput]) {
    input.addEventListener("blur", () => {
        if (/^\d{1,2}$/.test(input.value)) {
            input.value = input.value.padStart(2, "0")
            syncTimeInput()
        }
    })
}
minusHour.addEventListener("click", () => changeTime(-60))
plusHour.addEventListener("click", () => changeTime(60))
minusMinute.addEventListener("click", () => changeTime(-1))
plusMinute.addEventListener("click", () => changeTime(1))

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
    hourInput.value = ""
    minuteInput.value = ""  
    customTimeInput.removeAttribute("aria-invalid")
    timeButton.textContent = "Выбрать время"
})

timeButton.addEventListener("click", () => {
    hourInput.focus()
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
    editingId = null
    formDiv.style.display = "none"

    titleInput.value = "Задача"
    noteInput.value = ""

    selectedDate = ""
    selectedTime = ""

    dateButton.textContent = "Выбрать дату"
    timeButton.textContent = "Выбрать время"

    customTimeInput.value = ""
    hourInput.value = ""
    minuteInput.value = ""
    customTimeInput.removeAttribute("aria-invalid")

    formPriorityBtn.classList.remove(formPriorityBtn.classList[0])
    formPriorityBtn.classList.add("0")

    dateTimeDiv.style.display = "none"
}

formDiv.style.display = "none"
dateTimeDiv.style.display = "none"

addBtn.addEventListener("click", () => {
    if (editingId !== null) {
        formNewTask.requestSubmit()
        if (editingId !== null) return
    }

    main.appendChild(formDiv)
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
    if (!titleInput.value.trim()) {
        return
    }

    if (
        customTimeInput.value.trim() &&
        !timePattern.test(customTimeInput.value.trim())
    ) {
        customTimeInput.focus()
        return
    }
    if (editingId !== null) {
        const task = tasks.find(task => task.id === editingId)
        if (task) {
            task.title = titleInput.value
            task.note = noteInput.value
            task.date = selectedDate
            task.time = selectedTime
            task.priority = formPriorityBtn.classList[0]
        }
        main.appendChild(formDiv)
        updateTasks(tasks)
        hideForm()
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

function showForm(task, li) {
    li.querySelector(".task-content").style.display = "none"
    li.appendChild(formDiv)
    formDiv.style.display = "block"
    titleInput.value = task.title
    noteInput.value = task.note
    selectedDate = task.date
    selectedTime = task.time
    dateButton.textContent = task.date || "Выбрать дату"
    timeButton.textContent = task.time || "Выбрать время"
    customTimeInput.value = task.time || ""
    const [hours, minutes] = (task.time || "").split(":")
    hourInput.value = hours || ""
    minuteInput.value = minutes || ""
    formPriorityBtn.classList.remove(formPriorityBtn.classList[0])
    formPriorityBtn.classList.add(task.priority)
}

formDiv.addEventListener("click", (event) => {
    event.stopPropagation()
})