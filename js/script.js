
const aside = document.createElement("aside")
const main = document.createElement("main")
const heading = document.createElement("h1")
const navigation = document.createElement("nav")
const ul = document.createElement("ul")

let editingId = null
let activeSection = "today"
let activeSort = "manual"
let statusFilter = "all"
let draggingId = null

const orderType = ["Пользовательская", "Дата", "Приоритет"]
const sortModes = ["manual", "date", "priority"]
const filterTypes = ["Все статусы", "Невыполненные", "Выполненные"]
const filterModes = ["all", "active", "done"]

document.title = "To-Do List"
aside.id = "sidebar"
main.id = "app-main"
navigation.id = "sidebar-nav"
ul.id = "task-list"

document.body.append(aside, main)
main.append(heading)
heading.textContent = "Сегодня"
aside.append(navigation)
main.append(ul)

function makeButton(text, parent, id) {
    const button = document.createElement("button")
    button.type = "button"
    button.textContent = text
    if (id) button.id = id
    parent.append(button)
    return button
}

function makeIcon(name, fallback) {
    const wrapper = document.createElement("span")
    wrapper.className = "ui-icon"

    const image = document.createElement("img")
    image.alt = ""
    image.className = "ui-icon-image"
    image.width = 20
    image.height = 20
    image.style.display = "none"

    const fallbackElement = document.createElement("span")
    fallbackElement.className = "ui-icon-fallback"
    fallbackElement.textContent = fallback

    image.addEventListener("load", () => {
        image.style.display = "block"
        fallbackElement.style.display = "none"
    })

    image.addEventListener("error", () => {
        image.style.display = "none"
        fallbackElement.style.display = "inline"
    })

    image.src = `icons/${name}.png`
    wrapper.append(image, fallbackElement)
    return wrapper
}

function setButtonIcon(button, name, fallback, label = "") {
    button.replaceChildren(makeIcon(name, fallback))
    if (label) {
        const textSpan = document.createElement("span")
        textSpan.className = "button-label"
        textSpan.textContent = label
        button.append(textSpan)
    }
}

const allTasksBtn = makeButton("", navigation)
const todayBtn = makeButton("", navigation)
const nextWeekBtn = makeButton("", navigation)
const overdueBtn = makeButton("", navigation)
const completedBtn = makeButton("", navigation)

setButtonIcon(allTasksBtn, "all", "▤", "Все дела")
setButtonIcon(todayBtn, "today", "◷", "Сегодня")
setButtonIcon(nextWeekBtn, "week", "▦", "Ближайшая неделя")
setButtonIcon(overdueBtn, "overdue", "!", "Просроченные")
setButtonIcon(completedBtn, "completed", "✓", "Завершённые")
todayBtn.classList.add("nav-active")

const toolbar = document.createElement("div")
toolbar.id = "task-toolbar"
main.insertBefore(toolbar, ul)

const searchWrap = document.createElement("div")
searchWrap.id = "task-search-wrap"
searchWrap.append(makeIcon("search", "⌕"))

const searchInput = document.createElement("input")
searchInput.id = "task-search-input"
searchInput.type = "search"
searchInput.placeholder = "Поиск по названию или дате"
searchInput.autocomplete = "off"
searchInput.setAttribute("aria-label", "Поиск задач")
searchWrap.append(searchInput)
toolbar.append(searchWrap)

const orderBtn = makeButton("", toolbar, "task-sort-button")
orderBtn.classList.add("sort-control")

const statusBtn = makeButton("", toolbar, "task-status-button")
statusBtn.classList.add("status-control")

function updateSortButton() {
    const index = sortModes.indexOf(activeSort)

    orderBtn.replaceChildren(
        makeIcon("settings", "⚙"),
        makeIcon(`sort-${activeSort}`, "↕")
    )

    const label = document.createElement("span")
    label.className = "button-label"
    label.textContent = orderType[index]
    orderBtn.append(label)
    orderBtn.title = "Сменить сортировку"
}

function updateStatusButton() {
    const index = filterModes.indexOf(statusFilter)

    const iconName = statusFilter === "all"
        ? "filter-all"
        : statusFilter === "active"
            ? "filter-active"
            : "filter-done"

    const fallback = statusFilter === "all"
        ? "◉"
        : statusFilter === "active"
            ? "○"
            : "✓"

    setButtonIcon(statusBtn, iconName, fallback, filterTypes[index])
    statusBtn.title = "Фильтр по выполнению"
}

updateSortButton()
updateStatusButton()

const emptyState = document.createElement("p")
emptyState.id = "task-empty-state"
emptyState.textContent = "Задач пока нет"
main.insertBefore(emptyState, ul.nextSibling)

const tasks = JSON.parse(localStorage.getItem("tasks")) ?? []

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks))
}

function getTodayTasks() {
    const today = new Date()

    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

    return tasks.filter(task => task.date === todayString)
}

function getNextWeekTasks() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + 7)

    return tasks.filter(task => {
        if (!task.date) return false

        const taskDate = new Date(`${task.date}T00:00:00`)
        return taskDate >= today && taskDate < endDate
    })
}

function getOverdueTasks() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return tasks.filter(task => {
        if (!task.date) return false

        const taskDate = new Date(`${task.date}T00:00:00`)
        return taskDate < today && !task.completed
    })
}

function getCompletedTasks() {
    return tasks.filter(task => task.completed)
}

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
    if (priority === "1") title = "❗ " + title
    else if (priority === "2") title = "‼️ " + title

    const [li, div] = addLi(title, parent, id)
    li.dataset.taskId = String(id)

    if (note) {
        const paragraph = document.createElement("p")
        paragraph.textContent = note
        paragraph.classList.add("task-note")
        div.append(paragraph)
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

        div.append(paragraph)
    }

    const deleteBtn = makeButton("", div)
    deleteBtn.classList.add("delete-task-button")
    deleteBtn.setAttribute("aria-label", "Удалить задачу")
    setButtonIcon(deleteBtn, "trash", "🗑")

    deleteBtn.addEventListener("click", event => {
        event.stopPropagation()
        if (!finishOpenForm()) return

        const index = tasks.findIndex(task => task.id === id)
        if (index === -1) return

        tasks.splice(index, 1)
        saveTasks()
        updateTasks()
    })

    const completedBtn = makeButton("", div)
    completedBtn.classList.add("completed-button")
    completedBtn.setAttribute(
        "aria-label",
        completed ? "Отметить невыполненной" : "Отметить выполненной"
    )

    if (completed) li.classList.add("completed")

    completedBtn.addEventListener("click", event => {
        event.stopPropagation()
        if (!finishOpenForm()) return

        const task = tasks.find(task => task.id === id)
        if (!task) return

        task.completed = !task.completed
        saveTasks()
        updateTasks()
    })

    const dragHandle = makeButton("", div)
    dragHandle.classList.add("drag-handle")
    dragHandle.setAttribute("aria-label", "Перетащить задачу")

    dragHandle.title = activeSort === "manual"
        ? "Потяни, чтобы изменить порядок"
        : "Доступно при пользовательской сортировке"

    setButtonIcon(dragHandle, "drag", "⋮⋮")
    dragHandle.draggable = activeSort === "manual"
    dragHandle.disabled = activeSort !== "manual"

    dragHandle.addEventListener("click", event => {
        event.stopPropagation()
    })

    dragHandle.addEventListener("dragstart", event => {
        event.stopPropagation()

        if (activeSort !== "manual" || formDiv.style.display === "block") {
            event.preventDefault()
            return
        }

        draggingId = id
        event.dataTransfer.effectAllowed = "move"
        event.dataTransfer.setData("text/plain", String(id))
        li.classList.add("is-dragging")
    })

    dragHandle.addEventListener("dragend", () => {
        draggingId = null
        clearDragClasses()
    })

    li.addEventListener("dragover", event => {
        if (
            activeSort !== "manual" ||
            draggingId === null ||
            draggingId === id
        ) return

        event.preventDefault()
        event.stopPropagation()
        event.dataTransfer.dropEffect = "move"

        clearDropClasses()

        const rect = li.getBoundingClientRect()
        const after = event.clientY >= rect.top + rect.height / 2

        li.classList.add(after ? "drop-after" : "drop-before")
    })

    li.addEventListener("dragleave", event => {
        if (!li.contains(event.relatedTarget)) {
            li.classList.remove("drop-before", "drop-after")
        }
    })

    li.addEventListener("drop", event => {
        if (draggingId === null || activeSort !== "manual") return

        event.preventDefault()
        event.stopPropagation()

        const rect = li.getBoundingClientRect()
        const after = event.clientY >= rect.top + rect.height / 2
        const fromId = draggingId

        draggingId = null
        clearDragClasses()
        reorderTasks(fromId, id, after)
    })

    li.addEventListener("click", event => {
        event.stopPropagation()

        if (editingId === id) return
        if (!finishOpenForm()) return

        const task = tasks.find(task => task.id === id)
        const currentLi = document.getElementById(`task-li${id}`)

        if (task && currentLi) {
            editingId = id
            showForm(task, currentLi)
        }
    })
}

function getVisibleTasks() {
    let visibleTasks

    if (activeSection === "today") {
        visibleTasks = getTodayTasks()
    } else if (activeSection === "week") {
        visibleTasks = getNextWeekTasks()
    } else if (activeSection === "overdue") {
        visibleTasks = getOverdueTasks()
    } else if (activeSection === "completed") {
        visibleTasks = getCompletedTasks()
    } else {
        visibleTasks = [...tasks]
    }

    if (statusFilter === "active") {
        visibleTasks = visibleTasks.filter(task => !task.completed)
    } else if (statusFilter === "done") {
        visibleTasks = visibleTasks.filter(task => task.completed)
    }

    const query = searchInput.value.trim().toLocaleLowerCase("ru-RU")

    if (query) {
        visibleTasks = visibleTasks.filter(task => {
            const dateReadable = task.date
                ? new Date(`${task.date}T00:00:00`).toLocaleDateString("ru-RU")
                : ""

            const searchableText = [
                task.title,
                task.note,
                task.date,
                dateReadable
            ]
                .filter(Boolean)
                .join(" ")
                .toLocaleLowerCase("ru-RU")

            return searchableText.includes(query)
        })
    }

    return visibleTasks
}

function sortTasks(source) {
    const result = [...source]

    if (activeSort === "date") {
        result.sort((a, b) =>
            (a.date || "9999-12-31").localeCompare(b.date || "9999-12-31") ||
            (a.time || "23:59").localeCompare(b.time || "23:59") ||
            a.order - b.order
        )
    } else if (activeSort === "priority") {
        result.sort(
            (a, b) =>
                Number(b.priority) - Number(a.priority) ||
                a.order - b.order
        )
    } else {
        result.sort((a, b) => a.order - b.order)
    }

    return result
}

function updateTasks() {
    const sortedTasks = sortTasks(getVisibleTasks())
    ul.replaceChildren()

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

    emptyState.style.display = sortedTasks.length ? "none" : "block"

    emptyState.textContent = searchInput.value.trim()
        ? "По вашему запросу ничего не найдено"
        : "В этом разделе пока нет задач"
}

function clearDropClasses() {
    for (const item of ul.querySelectorAll(".drop-before, .drop-after")) {
        item.classList.remove("drop-before", "drop-after")
    }
}

function clearDragClasses() {
    for (const item of ul.querySelectorAll(
        ".is-dragging, .drop-before, .drop-after"
    )) {
        item.classList.remove("is-dragging", "drop-before", "drop-after")
    }
}

function reorderTasks(fromId, targetId, after) {
    if (activeSort !== "manual" || fromId === targetId) return

    const fullOrder = [...tasks].sort((a, b) => a.order - b.order)

    const visibleIds = new Set(
        getVisibleTasks().map(task => task.id)
    )

    const newVisibleIds = fullOrder
        .filter(task => visibleIds.has(task.id))
        .map(task => task.id)

    const fromIndex = newVisibleIds.indexOf(fromId)

    if (fromIndex === -1 || !newVisibleIds.includes(targetId)) return

    newVisibleIds.splice(fromIndex, 1)

    const targetIndex = newVisibleIds.indexOf(targetId)

    newVisibleIds.splice(
        targetIndex + (after ? 1 : 0),
        0,
        fromId
    )

    const byId = new Map(
        tasks.map(task => [task.id, task])
    )

    let i = 0

    const newFullOrder = fullOrder.map(task =>
        visibleIds.has(task.id)
            ? byId.get(newVisibleIds[i++])
            : task
    )

    newFullOrder.forEach((task, index) => {
        task.order = index
    })

    saveTasks()
    updateTasks()
}

searchInput.addEventListener("input", () => {
    if (!finishOpenForm()) return
    updateTasks()
})

orderBtn.addEventListener("click", () => {
    if (!finishOpenForm()) return

    const nextIndex =
        (sortModes.indexOf(activeSort) + 1) % sortModes.length

    activeSort = sortModes[nextIndex]
    updateSortButton()
    updateTasks()
})

statusBtn.addEventListener("click", () => {
    if (!finishOpenForm()) return

    const nextIndex =
        (filterModes.indexOf(statusFilter) + 1) % filterModes.length

    statusFilter = filterModes[nextIndex]
    updateStatusButton()
    updateTasks()
})

updateTasks()

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

const formPriorityBtn = makeButton("", formNewTask, "priority-button")
formPriorityBtn.classList.add("0")
setButtonIcon(formPriorityBtn, "flag", "⚑")

const dateTimeButton = makeButton("", formNewTask, "date-time-button")
setButtonIcon(dateTimeButton, "calendar", "▦")

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

function getDefaultTaskDate() {
    const date = new Date()

    if (activeSection === "today") {
        return `${date.getFullYear()}-${padCalendarNumber(date.getMonth() + 1)}-${padCalendarNumber(date.getDate())}`
    }

    if (activeSection === "week") {
        const daysUntilSunday = (7 - date.getDay()) % 7
        date.setDate(date.getDate() + daysUntilSunday)

        return `${date.getFullYear()}-${padCalendarNumber(date.getMonth() + 1)}-${padCalendarNumber(date.getDate())}`
    }

    return ""
}

function prepareNewTaskDate() {
    selectedDate = getDefaultTaskDate()

    if (selectedDate) {
        const [year, month, day] = selectedDate.split("-").map(Number)
        const date = new Date(year, month - 1, day)

        displayedMonth = new Date(year, month - 1, 1)

        dateButton.textContent = date.toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric"
        })
    } else {
        const today = new Date()
        displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        dateButton.textContent = "Выбрать дату"
    }

    renderCalendar()
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
    const formRect = formDiv.getBoundingClientRect()
    const popup = dateTimeDiv.getBoundingClientRect()

    let left = formRect.right + 14

    if (left + popup.width > window.innerWidth - 12) {
        left = anchor.right + 14
    }

    if (left + popup.width > window.innerWidth - 12) {
        left = Math.max(12, anchor.left - popup.width - 14)
    }

    let top = anchor.top - 12

    top = Math.max(
        12,
        Math.min(top, window.innerHeight - popup.height - 12)
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

dateTimeDiv.addEventListener("click", event => {
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

function finishOpenForm() {
    if (formDiv.style.display !== "block") return true
    formNewTask.requestSubmit()
    return formDiv.style.display !== "block"
}

addBtn.addEventListener("click", () => {
    if (activeSection === "overdue" || activeSection === "completed") return
    if (!finishOpenForm()) return

    main.appendChild(formDiv)
    formDiv.style.display = "block"

    prepareNewTaskDate()

    titleInput.focus()
    titleInput.select()
})

titleInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        event.preventDefault()
    }
})

saveTaskButton.addEventListener("click", () => {
    formNewTask.requestSubmit()
})

document.addEventListener("click", event => {
    if (formDiv.style.display !== "block") return

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

formNewTask.addEventListener("submit", event => {
    event.preventDefault()

        if (
        editingId === null &&
        (activeSection === "overdue" || activeSection === "completed")
    ) {
        return
    }

    if (!titleInput.value.trim()) return

    if (
        customTimeInput.value.trim() &&
        !timePattern.test(customTimeInput.value.trim())
    ) {
        hourInput.focus()
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
        hideForm()
        saveTasks()
        updateTasks()
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

    hideForm()
    saveTasks()
    updateTasks()
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

    if (task.date) {
        const [year, month] = task.date.split("-").map(Number)
        displayedMonth = new Date(year, month - 1, 1)
    }

    dateButton.textContent = task.date || "Выбрать дату"
    timeButton.textContent = task.time || "Выбрать время"
    customTimeInput.value = task.time || ""

    const [hours, minutes] = (task.time || "").split(":")
    hourInput.value = hours || ""
    minuteInput.value = minutes || ""

    formPriorityBtn.classList.remove(formPriorityBtn.classList[0])
    formPriorityBtn.classList.add(task.priority)
}

formDiv.addEventListener("click", event => {
    event.stopPropagation()
})

const sectionButtons = {
    all: allTasksBtn,
    today: todayBtn,
    week: nextWeekBtn,
    overdue: overdueBtn,
    completed: completedBtn
}

function setSection(section) {
    if (!finishOpenForm()) return

    activeSection = section

    addBtn.style.display =
    section === "overdue" || section === "completed"
        ? "none"
        : "grid"

    const labels = {
        all: "Все дела",
        today: "Сегодня",
        week: "Ближайшая неделя",
        overdue: "Просроченные",
        completed: "Завершённые"
    }

    heading.textContent = labels[section]

    statusFilter = "all"
    updateStatusButton()

    for (const button of Object.values(sectionButtons)) {
        button.classList.remove("nav-active")
    }

    sectionButtons[section].classList.add("nav-active")
    updateTasks()
}

for (const [section, button] of Object.entries(sectionButtons)) {
    button.addEventListener("click", () => setSection(section))
}
