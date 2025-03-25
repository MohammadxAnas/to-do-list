import { useEffect, useState } from "react";
import axios from "axios";
import "./home.css";
import { baseURL } from "../utils/constant";
import { API_KEY } from "../utils/constant";
import { FaEdit, FaTrash, FaPlus, FaLightbulb, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 
import { handleSuccess } from "../utils/toast";
import { jwtDecode } from "jwt-decode";


export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [loggedInUser, setLoggedInUser] = useState();
  const [loading, setLoading] = useState(true); // 🔹 Loading state added
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

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
     let suggestion =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I didn't understand that.";
      suggestion = suggestion.replace(/\*\*/g, ""); 
      suggestion = suggestion.replace(/\* /g,"✨" ); 
      console.log(suggestion);
      setTaskSuggestions((prev) => ({
        ...prev,
        [taskId]: suggestion,
      }));
    
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
    const handleUnload = async() => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found. Cannot remove account.");
            return;
        }
  
          const decodedToken = jwtDecode(token); // Decode JWT token
          const userId = decodedToken.id || decodedToken._id; // Extract user ID
  
          if (!userId) {
              console.error("User ID not found in token.");
              return;
          }
  
          await axios.post(`${baseURL}/auth/logout/${userId}`, {
              headers: { Authorization: `Bearer ${token}` }
          })
          .then(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("loggedInUser");
            handleSuccess("User Logged out ⚡");
            setTimeout(() => {
            navigate("/login");
          }, 1000);
          })
          .catch((err) => {
              console.error("internal error:",err );
          });
      } catch (error) {
          console.error("Error decoding token:", error);
      }
    };
    window.addEventListener("beforeunload", handleUnload);
  
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [navigate]);
  

  const handleLogout = async() => {

    try {
      const token = localStorage.getItem("token");
      if (!token) {
          console.error("No token found. Cannot remove account.");
          return;
      }

        const decodedToken = jwtDecode(token); // Decode JWT token
        const userId = decodedToken.id || decodedToken._id; // Extract user ID

        if (!userId) {
            console.error("User ID not found in token.");
            return;
        }

        await axios.post(`${baseURL}/auth/logout/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("loggedInUser");
          handleSuccess("User Logged out ⚡");
          setTimeout(() => {
          navigate("/login");
        }, 1000);
        })
        .catch((err) => {
            console.error("internal error:",err );
        });
    } catch (error) {
        console.error("Error decoding token:", error);
    }

    
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
  const handleRemove = () => {
    if (!window.confirm("Are you sure you want to remove your account? This action cannot be undone.")) {
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        console.error("No token found. Cannot remove account.");
        return;
    }

    try {
        const decodedToken = jwtDecode(token); // Decode JWT token
        const userId = decodedToken.id || decodedToken._id; // Extract user ID

        if (!userId) {
            console.error("User ID not found in token.");
            return;
        }

        axios.delete(`${baseURL}/auth/remove/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(() => {
            localStorage.clear();
            handleSuccess("Account removed successfully!");
            setTimeout(() => {
                navigate("/signup"); // Redirect to signup
            }, 1000);
        })
        .catch((err) => {
            console.error("Error deleting account:", err.response?.data || err.message);
        });
    } catch (error) {
        console.error("Error decoding token:", error);
    }
};
  


  return (
    <>
    <div className="main">
    <div className="greeting">
        <h1 className="logo">FocusFlow🎯</h1>
        <div
      className={`dynamic-island ${expanded ? "expanded" : ""}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="island-content">
        {expanded ? (
          <>
            <button className="logout" onClick={handleLogout}>
              Logout
            </button>
            <button className="remove-acc" onClick={handleRemove}>
              Remove Account
            </button>
          </>
        ) : (
          <FaSignOutAlt />
        )}
      </div>
    </div>
      </div>

      <div className="home">
        <h1><span className="rocket">🚀</span>What’s the Plan Today? </h1>

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
                         <FaLightbulb />
                      </button>
                    )}
                  </div>
                </div>

                {/* Suggestion should appear on a new line */}
                {taskSuggestions[task._id] && (
                  <div className="task-suggestion">
                   {taskSuggestions[task._id].split("\n").map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
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
