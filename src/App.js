import React from 'react';
import { useState } from 'react';
import './App.css';

const App = () => {
const [tasks, setTasks] = useState([]);
const [newTask, setNewTask] = useState("");

const addTask = () => {
  if (newTask.trim() !== "") {
    setTasks([...tasks, { text: newTask, completed: false }]);
    setNewTask("");
  }
};

const toggleTask = (index) => {
  const updatedTasks = tasks.map((task, i) =>
    i === index ? { ...task, completed: !task.completed } : task
  );
  setTasks(updatedTasks);
};

const removeTask = (index) => {
  setTasks(tasks.filter((_, i) => i !== index));
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
      />
      <button onClick={addTask}>Add</button>
    </div>
    <ul>
      {tasks.map((task, index) => (
        <li key={index} className={task.completed ? "completed" : ""}>
          <span onClick={() => toggleTask(index)}>{index+1}. {task.text}</span>
          <button onClick={() => removeTask(index)}>Delete</button>
        </li>
      ))}
    </ul>
  </div>
  );
}

export default App;
