import { useEffect, useState } from "react";
import axios from "axios";
import "./home.css";
import { baseURL } from "../utils/constant";
import { API_KEY } from "../utils/constant";
import { FaEdit, FaTrash, FaPlus, FaLightbulb } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 
import { handleSuccess } from "../utils/toast";


export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [loggedInUser, setLoggedInUser] = useState();
  const [loading, setLoading] = useState(true); // 🔹 Loading state added
  const navigate = useNavigate();

  const [taskSuggestions, setTaskSuggestions] = useState({});



  const sendMessage = async (TODO,taskId) => {
    try{
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Give a brief 2-3 line suggestion on how to complete this task: "${TODO}".` }] }],
        }),
      })
      const data = await response.json();
      const suggestion =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I didn't understand that.";
      console.log("suggestion=",suggestion);
        setTaskSuggestions((prev) => {
          const updatedSuggestions = { ...prev, [taskId]: suggestion };
          console.log("Updated Suggestions:", updatedSuggestions); // 🔍 Log new state
          return updatedSuggestions;
        });
     
      
    }catch(error){
      console.error("Error fetching response:", error);
    }  
    };
  
  

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("loggedInUser");
  
    if (!token) {
      navigate("/login"); // Redirect to login if no token found
    } else {
      setLoggedInUser(user);
      fetchTasks(token);
    }
  
    // Clear localStorage when tab is closed
    const handleUnload = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("loggedInUser");
    };
    window.addEventListener("beforeunload", handleUnload);
  
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [navigate]);
  

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    handleSuccess("User Logged out ⚡");
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  const fetchTasks = async (token) => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseURL}/api/get`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };
  
  
  const addTask = async () => {
    if (newTask.trim() === "") return;
    try {
      const res = await axios.post(
        `${baseURL}/api/save`,
        { todo: newTask, completed: false },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
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
        `${baseURL}/api/update/${id}`,
        { completed: !completed },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setTasks(tasks.map((task) => (task._id === id ? { ...task, completed: !completed } : task)));
    } catch (err) {
      console.error("Error updating task completion:", err);
    }
  };

  // Delete a task
  const removeTask = async (id) => {
    try {
      await axios.delete(`${baseURL}/api/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
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
        `${baseURL}/api/update/${editingTask}`,
        { todo: editedText },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
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
    <div className="main">
    <div className="greeting">
        <h1 className="logo">FocusFlow🎯</h1>
        <button className="logout" onClick={handleLogout}>Logout</button>
      </div>

      <div className="home">
        <h1>✨What’s the Plan Today? </h1>

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
                />
                <button onClick={updateTask} className="save-btn">Save</button>
              </>
            ) : (
              <>
                {/* Task Text and Buttons in a separate div */}
                <div className="task-content">
                  <span
                    className="task-text"
                    onClick={() => toggleTaskCompletion(task._id, task.completed)}
                    style={{
                      textDecoration: task.completed ? "line-through" : "none",
                      cursor: "pointer",
                    }}
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

                    {/* Hide Idea Button when a suggestion is available */}
                    {!taskSuggestions[task._id] && (
                      <button onClick={() => sendMessage(task.todo, task._id)} className="idea-btn">
                        ✨
                      </button>
                    )}
                  </div>
                </div>

                {/* Suggestion should appear on a new line */}
                {taskSuggestions[task._id] && (
                  <div className="task-suggestion">
                    <FaLightbulb /> {taskSuggestions[task._id]}
                  </div>
                )}
              </>
            )}
          </li>
        ))}
      </ul>

          </>
        )}
        <ToastContainer />
      </div>
    </div>
    </>
  );
}
