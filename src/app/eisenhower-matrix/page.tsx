"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    Plus,
    Trash2,
    CheckCircle2,
    Circle,
    Info,
    Move,
    Flame,
    Calendar,
    Users,
    Wind,
    PlusCircle,
    Lightbulb,
    ArrowLeft,
} from "lucide-react";

interface Task {
    id: number;
    content: string;
    quadrant: string;
    status: string;
}

const QUADRANTS = {
    DO: {
        id: "DO",
        title: "Urgent & Important",
        subtitle: "Do First",
        color: "bg-rose-500",
        hoverColor: "hover:bg-rose-600",
        lightColor: "bg-rose-50/80",
        borderColor: "border-rose-200",
        textColor: "text-rose-700",
        icon: <Flame className="w-5 h-5" />,
        description: "Critical tasks that need immediate action.",
    },
    SCHEDULE: {
        id: "SCHEDULE",
        title: "Not Urgent & Important",
        subtitle: "Schedule",
        color: "bg-indigo-500",
        hoverColor: "hover:bg-indigo-600",
        lightColor: "bg-indigo-50/80",
        borderColor: "border-indigo-200",
        textColor: "text-indigo-700",
        icon: <Calendar className="w-5 h-5" />,
        description: "Long-term goals and planning.",
    },
    DELEGATE: {
        id: "DELEGATE",
        title: "Urgent & Not Important",
        subtitle: "Delegate",
        color: "bg-amber-500",
        hoverColor: "hover:bg-amber-600",
        lightColor: "bg-amber-50/80",
        borderColor: "border-amber-200",
        textColor: "text-amber-700",
        icon: <Users className="w-5 h-5" />,
        description: "Tasks that can be done by someone else.",
    },
    ELIMINATE: {
        id: "ELIMINATE",
        title: "Not Urgent & Not Important",
        subtitle: "Eliminate",
        color: "bg-slate-500",
        hoverColor: "hover:bg-slate-600",
        lightColor: "bg-slate-50/80",
        borderColor: "border-slate-200",
        textColor: "text-slate-700",
        icon: <Wind className="w-5 h-5" />,
        description: "Distractions and time-wasters.",
    },
};

export default function EisenhowerMatrix() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState("");
    const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
    const [activeQuadrant, setActiveQuadrant] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [visibleLimit, setVisibleLimit] = useState(5);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await fetch("/api/tasks");
            if (res.ok) {
                const data = await res.json();
                setTasks(data);
            }
        } catch (error) {
            console.error("Fetch tasks error:", error);
        }
        setLoading(false);
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newTask, quadrant: "INBOX" }),
            });
            if (res.ok) {
                const task = await res.json();
                setTasks([task, ...tasks]);
                setNewTask("");
            }
        } catch (error) {
            console.error("Add task error:", error);
        }
    };

    const deleteTask = async (id: number) => {
        // In a real app we'd call DELETE API
        setTasks(tasks.filter((t) => t.id !== id));
    };

    const toggleComplete = async (id: number) => {
        const task = tasks.find((t) => t.id === id);
        if (!task) return;

        const newStatus = task.status === "DONE" ? "TODO" : "DONE";
        setTasks(tasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));

        try {
            await fetch("/api/tasks", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: newStatus }),
            });
        } catch (error) {
            console.error("Update task error:", error);
        }
    };

    const onDragStart = (id: number) => {
        setDraggedTaskId(id);
    };

    const onDragOver = (e: React.DragEvent, quadrantId: string) => {
        e.preventDefault();
        setActiveQuadrant(quadrantId);
    };

    const onDrop = async (e: React.DragEvent, quadrantId: string) => {
        e.preventDefault();
        if (draggedTaskId === null) return;

        setTasks(
            tasks.map((t) => (t.id === draggedTaskId ? { ...t, quadrant: quadrantId } : t))
        );

        try {
            await fetch("/api/tasks", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: draggedTaskId, quadrant: quadrantId }),
            });
        } catch (error) {
            console.error("Update task error:", error);
        }

        setDraggedTaskId(null);
        setActiveQuadrant(null);
    };

    const stats = {
        total: tasks.length,
        completed: tasks.filter((t) => t.status === "DONE").length,
    };

    const TaskCard = ({ task }: { task: Task }) => (
        <div
            draggable
            onDragStart={() => onDragStart(task.id)}
            className={`group flex items-center gap-3 p-3 mb-2 bg-white/90 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm transition-all duration-300 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-indigo-200 hover:scale-[1.02] active:scale-[0.98] ${task.status === "DONE" ? "opacity-60" : ""
                }`}
        >
            <button
                onClick={() => toggleComplete(task.id)}
                className="flex-shrink-0 transition-transform duration-200 hover:scale-125"
            >
                {task.status === "DONE" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                ) : (
                    <Circle className="w-5 h-5 text-slate-300" />
                )}
            </button>

            <span
                className={`flex-grow text-sm font-medium transition-all duration-300 ${task.status === "DONE" ? "line-through text-slate-400" : "text-slate-700"
                    }`}
            >
                {task.content}
            </span>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors duration-200"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    const Quadrant = ({ qConfig }: { qConfig: any }) => {
        const quadrantTasks = tasks.filter((t) => t.quadrant === qConfig.id);
        const isActive = activeQuadrant === qConfig.id;

        return (
            <div
                className={`relative flex flex-col h-full min-h-[300px] rounded-[2rem] border-2 transition-all duration-500 overflow-hidden ${isActive
                    ? "scale-[1.02] border-indigo-400 shadow-2xl z-10 bg-white"
                    : qConfig.borderColor + " bg-white/60 backdrop-blur-md shadow-lg shadow-slate-200/50"
                    }`}
                onDragOver={(e) => onDragOver(e, qConfig.id)}
                onDragLeave={() => setActiveQuadrant(null)}
                onDrop={(e) => onDrop(e, qConfig.id)}
            >
                <div className={`p-5 flex items-center justify-between border-b ${qConfig.borderColor} ${qConfig.lightColor} transition-colors duration-300`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-2xl text-white shadow-lg ${qConfig.color} transition-transform duration-500 hover:rotate-6`}>
                            {qConfig.icon}
                        </div>
                        <div>
                            <h3 className={`font-black text-sm uppercase tracking-wider ${qConfig.textColor}`}>{qConfig.title}</h3>
                            <p className="text-[10px] font-bold opacity-60 italic tracking-wide">{qConfig.subtitle}</p>
                        </div>
                    </div>
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full ${qConfig.color} bg-opacity-10 ${qConfig.textColor} animate-pulse`}>
                        {quadrantTasks.length}
                    </span>
                </div>

                <div
                    className="flex-grow p-4 overflow-y-auto custom-scrollbar scroll-smooth"
                    style={{ maxHeight: `${visibleLimit * 54 + 16}px` }}
                >
                    {quadrantTasks.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-4">
                            <div className={`p-4 rounded-full border-2 border-dashed ${qConfig.borderColor} mb-3`}>
                                <div className="flex items-center justify-center">
                                    <Move className="w-8 h-8" />
                                </div>
                            </div>
                            <p className="text-sm font-bold uppercase tracking-widest">Empty Space</p>
                        </div>
                    ) : (
                        quadrantTasks.map((task) => <TaskCard key={task.id} task={task} />)
                    )}
                </div>

                <div className="px-5 py-3 bg-white/40 border-t border-white/50">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5" /> {qConfig.description}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] relative overflow-hidden text-slate-900 font-sans p-4 md:p-8 flex flex-col">
            {/* Decorative Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[5%] right-[-10%] opacity-[0.05] text-amber-500 animate-pulse-slow">
                    <Lightbulb size={600} strokeWidth={0.5} />
                </div>
                <div className="absolute bottom-[10%] left-[-5%] opacity-[0.03] text-indigo-500">
                    <Lightbulb size={400} strokeWidth={0.5} />
                </div>
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-200/30 rounded-full blur-[120px] animate-blob-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] bg-amber-100/30 rounded-full blur-[120px] animate-blob-slow animation-delay-2000" />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#4f46e5 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }} />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto w-full flex-grow flex flex-col">
                <Link
                    href="/"
                    className="mb-6 flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-all group w-fit"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Models
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/80 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                            <Lightbulb className="w-3 h-3 text-amber-500" /> Eisenhower Matrix
                        </div>
                        <div className="flex items-center gap-4">
                            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-none">
                                Focus <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600">Matrix</span>
                            </h1>
                            <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl flex flex-col items-center justify-center shadow-sm">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Tasks</span>
                                <span className="text-xl font-black text-indigo-600 leading-none">{stats.total}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-6 bg-white/80 backdrop-blur-md p-4 px-6 rounded-[2rem] border border-white/80 shadow-xl shadow-slate-200/40 transition-all hover:shadow-2xl">
                            {/* Focus Depth Setting */}
                            <div className="flex flex-col gap-1 pr-6 border-r border-slate-100">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Focus Depth</span>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min="3"
                                        max="10"
                                        value={visibleLimit}
                                        onChange={(e) => setVisibleLimit(parseInt(e.target.value))}
                                        className="w-24 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 transition-all hover:accent-purple-600"
                                    />
                                    <span className="text-xs font-black text-indigo-600 w-4">{visibleLimit}</span>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Momentum</span>
                                <div className="flex items-center gap-3 mt-1">
                                    <div className="w-40 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-1000 ease-out"
                                            style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-black text-indigo-600 tabular-nums">
                                        {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-grow">
                    <div className="lg:col-span-3 flex flex-col gap-8">
                        <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-7 shadow-2xl shadow-indigo-100/50 border border-white/80">
                            <h2 className="text-xl font-black mb-5 text-slate-800 flex items-center gap-3">
                                <PlusCircle className="w-6 h-6 text-indigo-500" /> New Task
                            </h2>
                            <form onSubmit={handleAddTask} className="space-y-4">
                                <input
                                    type="text"
                                    value={newTask}
                                    onChange={(e) => setNewTask(e.target.value)}
                                    placeholder="Capture a thought..."
                                    className="w-full px-5 py-4 rounded-2xl bg-white/80 border-slate-200 border-2 focus:border-indigo-400 focus:ring-0 transition-all text-sm font-bold shadow-inner placeholder:text-slate-300"
                                />
                                <button
                                    type="submit"
                                    disabled={!newTask.trim()}
                                    className="w-full py-4 px-6 bg-slate-900 hover:bg-indigo-600 disabled:opacity-30 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Add to Inbox
                                </button>
                            </form>
                        </div>

                        <div
                            className={`flex-grow bg-slate-100/30 backdrop-blur-sm rounded-[2.5rem] p-7 border-2 border-dashed transition-all duration-500 min-h-[350px] ${activeQuadrant === "INBOX" ? "border-indigo-400 bg-indigo-50/50 scale-[1.02]" : "border-slate-300/50 hover:bg-slate-100/50"
                                }`}
                            onDragOver={(e) => onDragOver(e, "INBOX")}
                            onDrop={(e) => onDrop(e, "INBOX")}
                        >
                            <h2 className="text-xs font-black mb-6 text-slate-400 uppercase tracking-[0.2em]">Draft Queue</h2>
                            <div
                                className="space-y-3 overflow-y-auto custom-scrollbar pr-1 scroll-smooth"
                                style={{ maxHeight: `${visibleLimit * 54 + 16}px` }}
                            >
                                {tasks.filter((t) => t.quadrant === "INBOX").length === 0 ? (
                                    <div className="flex flex-col items-center justify-center pt-16 opacity-30 text-slate-400">
                                        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mb-4">
                                            <Move className="w-6 h-6" />
                                        </div>
                                        <p className="text-[11px] font-bold uppercase text-center leading-relaxed">Drag back here to<br />park your tasks</p>
                                    </div>
                                ) : (
                                    tasks.filter((t) => t.quadrant === "INBOX").map((task) => <TaskCard key={task.id} task={task} />)
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-9">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                            <Quadrant qConfig={QUADRANTS.DO} />
                            <Quadrant qConfig={QUADRANTS.SCHEDULE} />
                            <Quadrant qConfig={QUADRANTS.DELEGATE} />
                            <Quadrant qConfig={QUADRANTS.ELIMINATE} />
                        </div>
                    </div>
                </div>

                <footer className="mt-16 py-8 text-center relative z-10 group">
                    <div className="w-12 h-1 bg-slate-200 mx-auto rounded-full mb-6 transition-all group-hover:w-24 group-hover:bg-indigo-400" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Turning mental models into action</p>
                    <div className="flex items-center justify-center gap-2 mt-4">
                        <span className="h-px w-8 bg-gradient-to-r from-transparent to-slate-200" />
                        <p className="text-xs font-bold text-slate-500 tracking-tight">
                            Created with <span className="text-rose-500 animate-pulse inline-block mx-0.5">❤️</span> by <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-extrabold">Kaushal Soni</span>
                        </p>
                        <span className="h-px w-8 bg-gradient-to-l from-transparent to-slate-200" />
                    </div>
                </footer>
            </div>
        </div>
    );
}
