import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';

function App() {
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    // Зареждане на задачите от бекенда
    const fetchTasks = () => {
        axios.get('/tasks')
            .then(response => {
                // Ако бекендът връща HAL формат, извличаме задачите от _embedded.tasks,
                // иначе използваме директно response.data
                const tasksData = response.data._embedded ? response.data._embedded.tasks : response.data;
                console.log("Fetched tasks:", tasksData);
                setTasks(tasksData);
            })
            .catch(error => {
                console.error("Error fetching tasks:", error);
            });
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // Помощна функция за извличане на идентификатора на задачата
    const getTaskId = (task) => {
        if (task.id) return task.id;
        if (task._links && task._links.self && task._links.self.href) {
            const segments = task._links.self.href.split('/');
            return segments[segments.length - 1];
        }
        return null;
    };

    // Добавяне на нова задача
    const handleAddTask = (e) => {
        e.preventDefault();
        console.log("Adding new task:", newTaskTitle);
        axios.post('/tasks', { title: newTaskTitle, completed: false })
            .then(response => {
                console.log("Added task:", response.data);
                setNewTaskTitle('');
                fetchTasks();
            })
            .catch(error => {
                console.error("Error creating task:", error);
            });
    };

    // Изтриване на задача
    const handleDeleteTask = (task) => {
        const taskId = getTaskId(task);
        if (!taskId) {
            console.error("Task id not found for delete", task);
            return;
        }
        console.log("Deleting task with id:", taskId);
        axios.delete(`/tasks/${taskId}`)
            .then(response => {
                console.log("Deleted task response:", response.data);
                fetchTasks();
            })
            .catch(error => {
                console.error("Error deleting task:", error);
            });
    };

    // Превключване на състоянието "completed" на задачата чрез PATCH
    const toggleTaskCompleted = (task) => {
        const taskId = getTaskId(task);
        if (!taskId) {
            console.error("Task id not found for update", task);
            return;
        }
        console.log("Toggling completed for task:", task);
        // Изпращаме само нужните полета – title и новата стойност на completed
        const updatedTask = { title: task.title, completed: !task.completed };
        axios.patch(`/tasks/${taskId}`, updatedTask, { headers: { 'Content-Type': 'application/json' } })
            .then(response => {
                console.log("Updated task response:", response.data);
                fetchTasks();
            })
            .catch(error => {
                console.error("Error updating task:", error);
            });
    };

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <h1>Tasks</h1>
                {tasks.length ? (
                    <ul>
                        {tasks.map(task => {
                            const taskId = getTaskId(task);
                            return (
                                <li key={taskId}>
                  <span
                      onClick={() => toggleTaskCompleted(task)}
                      style={{
                          textDecoration: task.completed ? 'line-through' : 'none',
                          cursor: 'pointer'
                      }}
                  >
                    {task.title}
                  </span>
                                    {' '}
                                    <button onClick={() => toggleTaskCompleted(task)}>
                                        {task.completed ? 'Mark as Not Completed' : 'Mark as Completed'}
                                    </button>
                                    {' '}
                                    <button onClick={() => handleDeleteTask(task)}>Delete</button>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p>No tasks found.</p>
                )}
                {/* Форма за добавяне на нова задача */}
                <form onSubmit={handleAddTask}>
                    <input
                        type="text"
                        placeholder="Enter new task title"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        required
                    />
                    <button type="submit">Add Task</button>
                </form>
            </header>
        </div>
    );
}

export default App;
