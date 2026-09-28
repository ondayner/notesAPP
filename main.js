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
 * Actualiza los contadores visuales de tareas (totales, completadas e incompletas) en el footer.
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
 * asociando los eventos correspondientes (marcar estado, eliminar, editar).
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

        // Envía la actualización al servidor local en el puerto 3000
        await todoService.updateOne(todo.id, {
            text: taskInput.value,
            completed: isCompleted
        });

        updateCounters(); 
    });

    // 2. Evento para eliminar la tarea del DOM y de la API
    deleteBtn.addEventListener("click", async () => {
        liItem.remove(); 
        await todoService.deleteOne(todo.id);
        updateCounters(); 
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
            
            // Envía el texto actualizado al servidor local en el puerto 3000
            await todoService.updateOne(todo.id, {
                text: taskInput.value,
                completed: liItem.classList.contains("completed")
            });
        }
    });

    return liItem;
};

/**
 * Renderiza la lista completa de tareas en la interfaz gráfica.
 * @param {Array} todos - Arreglo de tareas obtenidas del servidor.
 */
const renderTodos = (todos) => {
    todoList.innerHTML = "";
    if (!todos) return;

    todos.forEach(todo => {
        const newTaskElement = createTodoItem(todo);
        todoList.appendChild(newTaskElement);
    });

    updateCounters();
};

// Evento para agregar una nueva tarea al hacer clic en el botón "+"
addBtn.addEventListener("click", async (e) => {
    if (!inputValid()) {
        e.preventDefault();
        return;
    }

    const textValue = inputNote.value.trim();

    // Registra la nueva tarea mediante el servicio en el puerto 3000
    const newTodo = await todoService.addOne({
        text: textValue,
        completed: false
    });

    if (newTodo) {
        const newTaskElement = createTodoItem(newTodo);
        todoList.appendChild(newTaskElement);
        inputNote.value = "";
        updateCounters(); 
    }
});

// Carga inicial: Obtiene y renderiza los elementos al cargar la ventana
window.onload = async () => {
    const todos = await todoService.getAll();
    renderTodos(todos);
};