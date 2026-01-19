"use client";

import { useState, useEffect } from "react";
import MagicButton from "@/components/MagicButton";
import "./matrix.css";

interface Task {
    id: number;
    content: string;
    isImportant: boolean;
    isUrgent: boolean;
    status: string;
}

export default function EisenhowerMatrix() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState("");
    const [showFullMatrix, setShowFullMatrix] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        const res = await fetch("/api/tasks");
        if (res.ok) {
            const data = await res.json();
            setTasks(data);
        }
        setLoading(false);
    };

    const addTask = async () => {
        if (!newTask.trim()) return;
        const res = await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: newTask, isImportant: false, isUrgent: false }),
        });
        if (res.ok) {
            const task = await res.json();
            setTasks([task, ...tasks]);
            setNewTask("");
        }
    };

    const toggleAttribute = async (id: number, attr: 'isImportant' | 'isUrgent') => {
        const taskToUpdate = tasks.find(t => t.id === id);
        if (!taskToUpdate) return;

        const newValue = !taskToUpdate[attr];

        // Optimistic update
        const updatedTasks = tasks.map(t =>
            t.id === id ? { ...t, [attr]: newValue } : t
        );
        setTasks(updatedTasks);

        try {
            await fetch("/api/tasks", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, [attr]: newValue }),
            });
        } catch (error) {
            console.error("Failed to update task", error);
        }
    };

    // Tasks categorized
    const doFirst = tasks.filter(t => t.isImportant && t.isUrgent);
    const schedule = tasks.filter(t => t.isImportant && !t.isUrgent);
    const delegate = tasks.filter(t => !t.isImportant && t.isUrgent);
    const deleteIt = tasks.filter(t => !t.isImportant && !t.isUrgent);

    if (showFullMatrix) {
        return (
            <div className="matrix-page full-matrix">
                <header className="matrix-header">
                    <h1 className="magic-text">Matrix View</h1>
                    <MagicButton onClick={() => setShowFullMatrix(false)}>Back to List</MagicButton>
                </header>
                <div className="matrix-grid full">
                    <Quadrant title="Do First (Urgent & Important)" tasks={doFirst} color="red" />
                    <Quadrant title="Schedule (Important)" tasks={schedule} color="blue" />
                    <Quadrant title="Delegate (Urgent)" tasks={delegate} color="green" />
                    <Quadrant title="Delete (Neither)" tasks={deleteIt} color="gray" />
                </div>
            </div>
        );
    }

    return (
        <div className="matrix-page">
            <header className="matrix-header">
                <h1 className="magic-text">Eisenhower Matrix</h1>
                <MagicButton onClick={() => setShowFullMatrix(true)}>Show Full Matrix</MagicButton>
            </header>

            <div className="content-area split-view">
                <div className="left-panel">
                    <div className="task-input-section glass-panel">
                        <input
                            type="text"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="New magical task..."
                            className="magic-input"
                            onKeyDown={(e) => e.key === 'Enter' && addTask()}
                        />
                        <MagicButton onClick={addTask}>Add</MagicButton>
                    </div>

                    <div className="task-list glass-panel">
                        {loading ? <p>Loading spells...</p> : tasks.length === 0 ? <p className="empty-msg">No tasks yet. Create some magic!</p> : tasks.map(task => (
                            <div key={task.id} className="task-item">
                                <span className="task-content">{task.content}</span>
                                <div className="task-controls">
                                    <button onClick={() => toggleAttribute(task.id, 'isImportant')} className={`toggle-btn ${task.isImportant ? 'active' : ''}`}>
                                        Important
                                    </button>
                                    <button onClick={() => toggleAttribute(task.id, 'isUrgent')} className={`toggle-btn ${task.isUrgent ? 'active' : ''}`}>
                                        Urgent
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <aside className="right-panel">
                    <div className="mini-matrix glass-panel">
                        <h4>Preview Matrix</h4>
                        <div className="matrix-grid mini">
                            <MiniQuadrant label="Do" count={doFirst.length} color="red" />
                            <MiniQuadrant label="Sch." count={schedule.length} color="blue" />
                            <MiniQuadrant label="Del." count={delegate.length} color="green" />
                            <MiniQuadrant label="Elim." count={deleteIt.length} color="gray" />
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

function Quadrant({ title, tasks, color }: { title: string, tasks: Task[], color: string }) {
    return (
        <div className={`quadrant ${color} glass-panel floating`} style={{ animationDelay: color === 'red' ? '0s' : '0.2s' }}>
            <h3>{title}</h3>
            <ul className="quadrant-list">
                {tasks.map(t => <li key={t.id} className="quadrant-item">{t.content}</li>)}
            </ul>
        </div>
    );
}

function MiniQuadrant({ label, count, color }: { label: string, count: number, color: string }) {
    return (
        <div className={`mini-quad ${color}`}>
            <span className="label">{label}</span>
            <span className="count">{count}</span>
        </div>
    );
}
