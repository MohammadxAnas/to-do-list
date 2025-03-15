import { useEffect, useState } from "react";
import axios from "axios";
import "./home.css";
import { baseURL } from "../utils/constant";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 
import { handleSuccess } from "../utils/toast";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [loggedInUser, setLoggedInUser] = useState("");
  const [loading, setLoading] = useState(true); // 🔹 Loading state added
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("loggedInUser");

    if (!token) {
      navigate("/login"); // Redirect to login if no token found
    } else {
      setLoggedInUser(user);
      fetchTasks(token);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    handleSuccess("User Logged out ⚡");
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  // Fetch tasks from backend with authentication
  const fetchTasks = async (token) => {
    setLoading(true); // 🔹 Start loading before API call
    try {
      const res = await axios.get("http://localhost:5000/api/get", {
        headers: { Authorization: token },
      });
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false); // 🔹 Stop loading after API call
    }
  };

  // Add a new task
  const addTask = async () => {
    if (newTask.trim() === "") return;
    try {
      const res = await axios.post(
       "http://localhost:5000/api/save",
        { todo: newTask, completed: false },
        { headers: { Authorization: localStorage.getItem("token") } }
      );
      setTasks([...tasks, res.data]);
      setNewTask("");
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = async (id, completed) => {
    try {
      await axios.put(
        `http://localhost:5000/api/update/${id}`,
        { completed: !completed },
        { headers: { Authorization: localStorage.getItem("token") } }
      );
      setTasks(tasks.map((task) => (task._id === id ? { ...task, completed: !completed } : task)));
    } catch (err) {
      console.error("Error updating task completion:", err);
    }
  };

  // Delete a task
  const removeTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/delete/${id}`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
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
      await axios.put(
        `http://localhost:5000/api/update/${editingTask}`,
        { todo: editedText },
        { headers: { Authorization: localStorage.getItem("token") } }
      );
      setTasks(tasks.map((task) => (task._id === editingTask ? { ...task, todo: editedText } : task)));
      setEditingTask(null);
      setEditedText("");
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  return (
    <>
      <div className="greeting">
        <h1>⚡ Welcome back, {loggedInUser}</h1>
        <button className="logout" onClick={handleLogout}>Logout</button>
      </div>

      <div className="container">
        <h1>✨ To-Do List </h1>

        {/* 🔹 Show Loader while fetching data */}
        {loading ? (
          <div className="loader"></div>
        ) : (
          <>
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
          </>
        )}
        <ToastContainer />
      </div>
    </>
  );
}
