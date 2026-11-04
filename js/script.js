// создние основной структуры
const aside = document.createElement("aside")
const main = document.createElement("main")
const heading = document.createElement("h1")
const navigation = document.createElement("nav")
const ul = document.createElement("ul")



document.body.appendChild(aside)
document.body.appendChild(main)
main.appendChild(heading)
heading.textContent = "Сегодня"
aside.appendChild(navigation)
main.appendChild(ul)

makeButton("Все дела", navigation)
makeButton("Сегодня", navigation)
makeButton("Ближайшая неделя", navigation)
makeButton("Просроченные", navigation)
makeButton("Завершённые", navigation)

function makeButton(text, parent){
    const button = document.createElement("button")
    button.textContent = text
    parent.appendChild(button)

}

function addLi(text, parent){
    const li = document.createElement("li")
    parent.appendChild(li)
    li.textContent = text
}

const tasks = ['Сделать лабу', 'Съездить в магазин', 'Покормить кота']

for (let i of tasks) {
    addLi(i, ul)
}
