class TaskManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.tasks = JSON.parse(localStorage.getItem('pomodoroTasks') || '[]');
        console.log('TaskManager: Loaded tasks', this.tasks);
        this.eventBus.publish('tasksLoaded', this.tasks);

        this.eventBus.subscribe('addTask', (text) => this.addTask(text));
        this.eventBus.subscribe('toggleTask', (id) => this.toggleTask(id));
        this.eventBus.subscribe('deleteTask', (id) => this.deleteTask(id));
    }

    addTask(text) {
        const task = { id: Date.now().toString(), text, completed: false };
        this.tasks.push(task);
        localStorage.setItem('pomodoroTasks', JSON.stringify(this.tasks));
        console.log('TaskManager: Added task', task);
        this.eventBus.publish('taskAdded', task);
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            localStorage.setItem('pomodoroTasks', JSON.stringify(this.tasks));
            console.log('TaskManager: Toggled task', task);
            this.eventBus.publish('taskToggled', task);
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        localStorage.setItem('pomodoroTasks', JSON.stringify(this.tasks));
        console.log('TaskManager: Deleted task', id);
        this.eventBus.publish('taskDeleted', id);
    }
}
