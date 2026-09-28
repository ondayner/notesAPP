import todoService from "./todoService.js";

// Selección de elementos del DOM
const msgError = document.querySelector(".error-message");
const inputNote = document.querySelector(".todo-input");
const addBtn = document.querySelector(".add-btn");
const todoList = document.querySelector(".todo-list");
const todoTemplate = document.getElementById("todo-item-template");

const totalCounter = document.querySelector(".badge-total span");
const completedCounter = document.querySelector(".badge-completed span");
const incompleteCounter = document.querySelector(".badge-incomplete span");

/**
 * Guarda una copia de respaldo de las tareas actuales en el localStorage del navegador.
 */
const saveTasksToLocalStorage = () => {
    const tasks = [];
    const todoItems = todoList.querySelectorAll(".todo-item");

    todoItems.forEach(item => {
        const id = item.id;
        const text = item.querySelector(".task-text").value;
        const isCompleted = item.classList.contains("completed");
        tasks.push({ id, text, completed: isCompleted });
    });

    localStorage.setItem("todos_backup", JSON.stringify(tasks));
};

/**
 * Actualiza los contadores visuales de tareas totales, completadas e incompletas en el footer.
 */
const updateCounters = () => {
    const totalTasks = todoList.querySelectorAll(".todo-item").length;
    const completedTasks = todoList.querySelectorAll(".todo-item.completed").length;
    const incompleteTasks = totalTasks - completedTasks;

    totalCounter.textContent = totalTasks;
    completedCounter.textContent = completedTasks;
    incompleteCounter.textContent = incompleteTasks;
};

/**
 * Valida si el input principal de texto no está vacío y gestiona los avisos visuales de error.
 * @returns {boolean} True si es válido, false en caso contrario.
 */
const inputValid = () => {
    if (inputNote.value.trim() === "") {
        msgError.style.display = "block";
        inputNote.style.border = "1px solid var(--error-color)";
        return false; 
    } else {
        msgError.style.display = "none";
        inputNote.style.border = "1px solid var(--border-color)";
        return true; 
    }
};

inputNote.addEventListener("input", inputValid);

/**
 * Crea y configura un elemento visual (li) de tarea a partir de la plantilla HTML,
 * asociando los eventos correspondientes y actualizando tanto el servidor como el localStorage.
 * @param {Object} todo - Objeto de la tarea ({ id, text, completed }).
 * @returns {HTMLElement} El nodo `<li>` configurado.
 */
const createTodoItem = (todo) => {
    const clonedTemplate = document.importNode(todoTemplate.content, true);

    const liItem = clonedTemplate.querySelector(".todo-item");
    const taskInput = clonedTemplate.querySelector(".task-text");
    const statusBtn = clonedTemplate.querySelector(".status-btn");
    const deleteBtn = clonedTemplate.querySelector(".delete-btn");
    const editBtn = clonedTemplate.querySelector(".edit-btn");

    taskInput.value = todo.text;
    liItem.id = todo.id;
    liItem.dataset.editing = "false"; 

    if (todo.completed) {
        liItem.classList.add("completed");
        editBtn.setAttribute("disabled", "true");
    }

    // 1. Evento para marcar o desmarcar la tarea como completada
    statusBtn.addEventListener("click", async () => {
        liItem.classList.toggle("completed");
        const isCompleted = liItem.classList.contains("completed");
        
        if (isCompleted) {
            editBtn.setAttribute("disabled", "true");
        } else {
            editBtn.removeAttribute("disabled");
        }

        // Actualiza en el servidor local (puerto 3000)
        await todoService.updateOne(todo.id, {
            text: taskInput.value,
            completed: isCompleted
        });

        updateCounters(); 
        saveTasksToLocalStorage(); // Respaldo en localStorage
    });

    // 2. Evento para eliminar la tarea del DOM y de la API
    deleteBtn.addEventListener("click", async () => {
        liItem.remove(); 
        await todoService.deleteOne(todo.id);
        updateCounters(); 
        saveTasksToLocalStorage(); // Respaldo en localStorage
    });

    // 3. Evento para editar el texto de la tarea
    editBtn.addEventListener("click", async () => {
        const isEditing = liItem.dataset.editing === "true";

        if (!isEditing) {
            taskInput.removeAttribute("readonly");
            taskInput.focus(); 
            editBtn.textContent = "💾"; 
            liItem.dataset.editing = "true";
        } else {
            if (taskInput.value.trim() === "") {
                inputValid();
                return; 
            }

            taskInput.setAttribute("readonly", "true");
            editBtn.textContent = "✎"; 
            liItem.dataset.editing = "false";
            
            // Actualiza el texto en el servidor local
            await todoService.updateOne(todo.id, {
                text: taskInput.value,
                completed: liItem.classList.contains("completed")
            });

            saveTasksToLocalStorage(); // Respaldo en localStorage
        }
    });

    return liItem;
};

/**
 * Renderiza la lista completa de tareas en la interfaz gráfica.
 * @param {Array} todos - Arreglo de tareas.
 */
const renderTodos = (todos) => {
    todoList.innerHTML = "";
    if (!todos) return;

    todos.forEach(todo => {
        const newTaskElement = createTodoItem(todo);
        todoList.appendChild(newTaskElement);
    });

    updateCounters();
    saveTasksToLocalStorage(); // Asegura el respaldo inicial
};

// Evento para agregar una nueva tarea al hacer clic en el botón "+"
addBtn.addEventListener("click", async (e) => {
    if (!inputValid()) {
        e.preventDefault();
        return;
    }

    const textValue = inputNote.value.trim();

    // 1. Envía la nueva tarea al servidor en el puerto 3000
    const newTodo = await todoService.addOne({
        text: textValue,
        completed: false
    });

    if (newTodo) {
        const newTaskElement = createTodoItem(newTodo);
        todoList.appendChild(newTaskElement);
        inputNote.value = "";
        updateCounters(); 
        saveTasksToLocalStorage(); // 2. Guarda el cambio en localStorage simultáneamente
    }
});

// Carga inicial al abrir la ventana
window.onload = async () => {
    // Intentamos cargar primero desde el servidor local (puerto 3000)
    let todos = await todoService.getAll();

    // Si el servidor fallara o no respondiera, podemos usar localStorage como respaldo de emergencia:
    if (!todos || todos.length === 0) {
        const localBackup = JSON.parse(localStorage.getItem("todos_backup"));
        if (localBackup && localBackup.length > 0) {
            todos = localBackup;
        }
    }

    renderTodos(todos);
};