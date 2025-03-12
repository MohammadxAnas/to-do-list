import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import { baseURL } from "./utils/constant";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

export default function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [editedText, setEditedText] = useState("");

  // Fetch tasks from backendd
  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${baseURL}/get`);
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Add a new task
  const addTask = async () => {
    if (newTask.trim() === "") return;
    try {
      const res = await axios.post(`${baseURL}/save`, { todo: newTask, completed: false });
      setTasks([...tasks, res.data]);
      setNewTask("");
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = async (id, completed) => {
    try {
      await axios.put(`${baseURL}/update/${id}`, { completed: !completed });
      setTasks(tasks.map((task) => (task._id === id ? { ...task, completed: !completed } : task)));
    } catch (err) {
      console.error("Error updating task completion:", err);
    }
  };

  // Delete a task
  const removeTask = async (id) => {
    try {
      await axios.delete(`${baseURL}/delete/${id}`);
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  // Start editing a task
  const startEditing = (task) => {
    setEditingTask(task._id);
    setEditedText(task.todo);
  };

  // Update a task
  const updateTask = async () => {
    if (editedText.trim() === "") return;
    try {
      await axios.put(`${baseURL}/update/${editingTask}`, { todo: editedText });
      setTasks(tasks.map((task) => (task._id === editingTask ? { ...task, todo: editedText } : task)));
      setEditingTask(null);
      setEditedText("");
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  return (
    <div className="container">
      <h1>To-Do List</h1>
      <div className="input-section">
        <input
          type="text"
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          style={{ outline: "none" }}
        />
        <button onClick={addTask} className="add-btn">
          <FaPlus />
        </button>
      </div>

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task._id} className="task-item">
            {editingTask === task._id ? (
              <>
                <input 
                  className="edit-area"
                  type="text" 
                  value={editedText} 
                  onChange={(e) => setEditedText(e.target.value)} 
                  style={{ outline: "none" }}
                />
                <button onClick={updateTask} className="save-btn">Save</button>
              </>
            ) : (
              <>
                <span 
                  className="task-text" 
                  onClick={() => toggleTaskCompletion(task._id, task.completed)}
                  style={{ textDecoration: task.completed ? "line-through" : "none", cursor: "pointer" }}
                >
                  {task.todo}
                </span>
                <div className="task-buttons">
                  <button onClick={() => startEditing(task)} className="edit-btn">
                    <FaEdit />
                  </button>
                  <button onClick={() => removeTask(task._id)} className="delete-btn">
                    <FaTrash />
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}