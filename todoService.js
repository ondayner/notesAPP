import fetchService from "./fetchService.js";

/**
 * @typedef {Object} Todo
 * @property {string|number} id - Identificador único de la tarea
 * @property {string} text - Contenido o texto de la tarea
 * @property {boolean} completed - Estado que indica si la tarea está completada
 */

const PORT = 3000;
const API_RESOURCE = "/todos";
const API_URL = `http://localhost:${PORT}${API_RESOURCE}`;

/**
 * Obtiene todas las tareas almacenadas en el servidor local (json-server).
 * @returns {Promise<Todo[]|undefined>} Lista de tareas.
 */
const getAll = async () => {
  try {
    const { data } = await fetchService.get(API_URL);
    return data;
  } catch (error) {
    console.error("Error al obtener las tareas:", error);
    return [];
  }
};

/**
 * Crea una nueva tarea enviándola al servidor local.
 * @param {Object} payload - Los datos de la tarea ({ text, completed }).
 * @returns {Promise<Todo|undefined>} La tarea creada devuelta por el servidor.
 */
const addOne = async ({ text, completed = false }) => {
  try {
    const newTodo = { text, completed };
    const { data } = await fetchService.post(API_URL, newTodo);
    return data;
  } catch (error) {
    console.error("Error al crear la tarea:", error);
  }
};

/**
 * Actualiza una tarea existente por su ID.
 * @param {string|number} id - ID de la tarea.
 * @param {Object} payload - Nuevos datos (texto y/o estado completed).
 * @returns {Promise<Todo|undefined>} La tarea actualizada.
 */
const updateOne = async (id, payload) => {
  try {
    const { data } = await fetchService.put(`${API_URL}/${id}`, payload);
    return data;
  } catch (error) {
    console.error("Error al actualizar la tarea:", error);
  }
};

/**
 * Elimina una tarea utilizando su ID.
 * @param {string|number} id - ID de la tarea a eliminar.
 * @returns {Promise<Object|undefined>} Resultado de la eliminación.
 */
const deleteOne = async (id) => {
  try {
    const { data } = await fetchService.del(`${API_URL}/${id}`);
    return data;
  } catch (error) {
    console.error("Error al eliminar la tarea:", error);
  }
};

const todoService = {
  getAll,
  addOne,
  updateOne,
  deleteOne,
};

export default todoService;