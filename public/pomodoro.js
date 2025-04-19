class PomodoroApp {
    constructor() {
        this.eventBus = new EventBus();
        this.settingsManager = new SettingsManager(this.eventBus);
        const settings = this.settingsManager.settings;
        this.timer = new Timer(this.eventBus, settings);
        this.modeManager = new ModeManager(this.eventBus, settings);
        this.taskManager = new TaskManager(this.eventBus);
        this.themeManager = new ThemeManager(this.eventBus);
        this.notificationManager = new NotificationManager(this.eventBus);

        this.setupEventListeners();
        this.setupUISubscriptions();
        this.eventBus.publish('updateClock', this.timer.remainingTime);
    }

    setupEventListeners() {
        const startButton = document.getElementById('start');
        const pauseButton = document.getElementById('pause');
        const resetButton = document.getElementById('reset');
        const pomodoroButton = document.getElementById('pomodoro');
        const shortBreakButton = document.getElementById('short-break');
        const longBreakButton = document.getElementById('long-break');
        const saveSettingsButton = document.getElementById('save-settings');
        const addTaskButton = document.getElementById('add-task-btn');
        const taskInput = document.getElementById('task-input');
        const themeToggle = document.getElementById('checkbox');

        if (startButton) startButton.addEventListener('click', () => this.eventBus.publish('startTimer'));
        if (pauseButton) pauseButton.addEventListener('click', () => this.eventBus.publish('pauseTimer'));
        if (resetButton) resetButton.addEventListener('click', () => this.eventBus.publish('resetTimer'));
        if (pomodoroButton) pomodoroButton.addEventListener('click', () => this.eventBus.publish('switchMode', 'pomodoro'));
        if (shortBreakButton) shortBreakButton.addEventListener('click', () => this.eventBus.publish('switchMode', 'shortBreak'));
        if (longBreakButton) longBreakButton.addEventListener('click', () => this.eventBus.publish('switchMode', 'longBreak'));
        if (saveSettingsButton) {
            saveSettingsButton.addEventListener('click', () => {
                const pomodoro = parseInt(document.getElementById('pomodoro-time')?.value);
                const shortBreak = parseInt(document.getElementById('short-break-time')?.value);
                const longBreak = parseInt(document.getElementById('long-break-time')?.value);
                const autoSwitch = document.getElementById('auto-switch')?.checked || this.settingsManager.settings.autoSwitch;
                const notificationDuration = parseInt(document.getElementById('notification-duration')?.value);
                if (pomodoro > 0 && shortBreak > 0 && longBreak > 0) {
                    this.eventBus.publish('saveSettings', { pomodoro, shortBreak, longBreak, autoSwitch, notificationDuration });
                    alert('Настройки сохранены!');
                }
            });
        }
        if (addTaskButton) {
            addTaskButton.addEventListener('click', () => {
                const text = document.getElementById('task-input')?.value.trim();
                if (text) {
                    this.eventBus.publish('addTask', text);
                    document.getElementById('task-input').value = '';
                }
            });
        }
        if (taskInput) {
            taskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const text = taskInput.value.trim();
                    if (text) {
                        this.eventBus.publish('addTask', text);
                        taskInput.value = '';
                    }
                }
            });
        }
        if (themeToggle) themeToggle.addEventListener('change', () => this.eventBus.publish('toggleTheme'));
    }

    setupUISubscriptions() {
        this.eventBus.subscribe('updateClock', (time) => {
            const minutesEl = document.getElementById('minutes');
            const secondsEl = document.getElementById('seconds');
            if (minutesEl && secondsEl) {
                minutesEl.textContent = time.minutes.toString().padStart(2, '0');
                secondsEl.textContent = time.seconds.toString().padStart(2, '0');
                document.title = `${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')} - Pomodoro Timer`;
            }
        });

        this.eventBus.subscribe('modeSwitched', (mode) => {
            const modeToId = {
                pomodoro: 'pomodoro',
                shortBreak: 'short-break',
                longBreak: 'long-break'
            };
            const pomodoroEl = document.getElementById('pomodoro');
            const shortBreakEl = document.getElementById('short-break');
            const longBreakEl = document.getElementById('long-break');

            if (pomodoroEl) pomodoroEl.classList.remove('active');
            else console.error("Element #pomodoro not found");
            if (shortBreakEl) shortBreakEl.classList.remove('active');
            else console.error("Element #short-break not found");
            if (longBreakEl) longBreakEl.classList.remove('active');
            else console.error("Element #long-break not found");

            const id = modeToId[mode];
            if (id) {
                const element = document.getElementById(id);
                if (element) {
                    element.classList.add('active');
                } else {
                    console.error(`Element with ID ${id} not found`);
                }
            } else {
                console.error(`No mapping for mode: ${mode}`);
            }
        });

        this.eventBus.subscribe('tasksLoaded', (tasks) => this.renderTasks(tasks));
        this.eventBus.subscribe('taskAdded', (task) => this.addTaskToUI(task));
        this.eventBus.subscribe('taskToggled', (task) => this.toggleTaskInUI(task));
        this.eventBus.subscribe('taskDeleted', (id) => this.deleteTaskFromUI(id));

        this.eventBus.subscribe('timerStarted', () => {
            const startButton = document.getElementById('start');
            const pauseButton = document.getElementById('pause');
            if (startButton && pauseButton) {
                startButton.style.display = 'none';
                pauseButton.style.display = 'inline-block';
                startButton.classList.add('hidden');
                pauseButton.classList.remove('hidden');
            } else {
                console.error('Start or Pause button not found');
            }
        });

        this.eventBus.subscribe('timerPaused', () => {
            const startButton = document.getElementById('start');
            const pauseButton = document.getElementById('pause');
            if (startButton && pauseButton) {
                startButton.style.display = 'inline-block';
                pauseButton.style.display = 'none';
                startButton.classList.remove('hidden');
                pauseButton.classList.add('hidden');
            } else {
                console.error('Start or Pause button not found');
            }
        });

        this.eventBus.subscribe('timerReset', () => {
            const startButton = document.getElementById('start');
            const pauseButton = document.getElementById('pause');
            if (startButton && pauseButton) {
                startButton.style.display = 'inline-block';
                pauseButton.style.display = 'none';
                startButton.classList.remove('hidden');
                pauseButton.classList.add('hidden');
            } else {
                console.error('Start or Pause button not found');
            }
        });

        this.eventBus.subscribe('settingsLoaded', (settings) => {
            const pomodoroInput = document.getElementById('pomodoro-time');
            const shortBreakInput = document.getElementById('short-break-time');
            const longBreakInput = document.getElementById('long-break-time');
            const autoSwitchInput = document.getElementById('auto-switch');
            const notificationDurationInput = document.getElementById('notification-duration');

            if (pomodoroInput) pomodoroInput.value = settings.pomodoro;
            if (shortBreakInput) shortBreakInput.value = settings.shortBreak;
            if (longBreakInput) longBreakInput.value = settings.longBreak;
            if (autoSwitchInput) autoSwitchInput.checked = settings.autoSwitch;
            if (notificationDurationInput) notificationDurationInput.value = settings.notificationDuration;
        });

        this.eventBus.subscribe('themeSwitched', (theme) => {
            const checkbox = document.getElementById('checkbox');
            if (checkbox) {
                checkbox.checked = theme === 'dark';
            } else {
                console.error('Checkbox not found');
            }
        });
    }

    renderTasks(tasks) {
        const taskList = document.getElementById('task-list');
        if (!taskList) {
            console.error('Task list not found');
            return;
        }
        taskList.innerHTML = '';
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.dataset.id = task.id;
            if (task.completed) {
                li.classList.add('task-complete');
            }
            li.innerHTML = `
                <span class="task-text">${task.text}</span>
                <div class="task-actions">
                    <button class="complete-btn"><i class="fa-solid fa-check"></i></button>
                    <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            li.querySelector('.complete-btn').addEventListener('click', () => this.eventBus.publish('toggleTask', task.id));
            li.querySelector('.delete-btn').addEventListener('click', () => this.eventBus.publish('deleteTask', task.id));
            taskList.appendChild(li);
        });
    }

    addTaskToUI(task) {
        const taskList = document.getElementById('task-list');
        if (!taskList) {
            console.error('Task list not found');
            return;
        }
        const li = document.createElement('li');
        li.dataset.id = task.id;
        if (task.completed) {
            li.classList.add('task-complete');
        }
        li.innerHTML = `
            <span class="task-text">${task.text}</span>
            <div class="task-actions">
                <button class="complete-btn"><i class="fa-solid fa-check"></i></button>
                <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        li.querySelector('.complete-btn').addEventListener('click', () => this.eventBus.publish('toggleTask', task.id));
        li.querySelector('.delete-btn').addEventListener('click', () => this.eventBus.publish('deleteTask', task.id));
        taskList.appendChild(li);
    }

    toggleTaskInUI(task) {
        const li = document.querySelector(`li[data-id="${task.id}"]`);
        if (li) {
            li.classList.toggle('task-complete');
        }
    }

    deleteTaskFromUI(id) {
        const li = document.querySelector(`li[data-id="${id}"]`);
        if (li) {
            li.remove();
        }
    }
}