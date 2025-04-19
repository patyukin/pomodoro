class Timer {
    constructor(eventBus, settings) {
        this.eventBus = eventBus;
        this.settings = settings;
        this.mode = 'pomodoro';
        this.remainingTime = {
            total: this.settings.pomodoro * 60,
            minutes: this.settings.pomodoro,
            seconds: 0
        };
        this.isActive = false;
        this.timerId = null;
        this.startTime = null;
        this.pausedElapsed = null;

        this.eventBus.subscribe('modeSwitched', (newMode) => this.onModeSwitched(newMode));
        this.eventBus.subscribe('settingsSaved', (newSettings) => this.onSettingsSaved(newSettings));
        this.eventBus.subscribe('startTimer', () => this.start());
        this.eventBus.subscribe('pauseTimer', () => this.pause());
        this.eventBus.subscribe('resetTimer', () => this.reset());
    }

    onModeSwitched(newMode) {
        console.log(`Timer: Mode switched to ${newMode}`);
        this.mode = newMode;
        this.remainingTime.total = this.settings[newMode] * 60;
        this.remainingTime.minutes = this.settings[newMode];
        this.remainingTime.seconds = 0;
        this.pausedElapsed = null;
        this.eventBus.publish('updateClock', this.remainingTime);
    }

    onSettingsSaved(newSettings) {
        console.log('Timer: Settings updated', newSettings);
        this.settings = newSettings;
        if (!this.isActive) {
            this.remainingTime.total = this.settings[this.mode] * 60;
            this.remainingTime.minutes = this.settings[this.mode];
            this.remainingTime.seconds = 0;
            this.pausedElapsed = null;
            this.eventBus.publish('updateClock', this.remainingTime);
        }
    }

    start() {
        if (this.remainingTime.total <= 0) {
            this.reset();
        }
        this.isActive = true;
        if (this.pausedElapsed !== null) {
            this.startTime = Date.now() - (this.pausedElapsed * 1000);
            this.pausedElapsed = null;
        } else {
            this.startTime = Date.now();
        }
        console.log('Timer: Started');
        this.eventBus.publish('timerStarted');
        this.timerId = setInterval(() => this.update(), 1000);
    }

    pause() {
        clearInterval(this.timerId);
        this.isActive = false;
        if (this.startTime) {
            const currentTime = Date.now();
            this.pausedElapsed = Math.floor((currentTime - this.startTime) / 1000);
        }
        console.log('Timer: Paused');
        this.eventBus.publish('timerPaused');
    }

    reset() {
        clearInterval(this.timerId);
        this.isActive = false;
        this.pausedElapsed = null;
        this.startTime = null;
        this.remainingTime.total = this.settings[this.mode] * 60;
        this.remainingTime.minutes = this.settings[this.mode];
        this.remainingTime.seconds = 0;
        console.log('Timer: Reset');
        this.eventBus.publish('updateClock', this.remainingTime);
        this.eventBus.publish('timerReset');
    }

    update() {
        if (!this.startTime) return;
        const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        const totalTime = this.settings[this.mode] * 60;
        this.remainingTime.total = Math.max(0, totalTime - elapsedSeconds);
        this.remainingTime.minutes = Math.floor(this.remainingTime.total / 60);
        this.remainingTime.seconds = this.remainingTime.total % 60;
        this.eventBus.publish('updateClock', this.remainingTime);
        if (this.remainingTime.total <= 0) {
            clearInterval(this.timerId);
            this.isActive = false;
            this.pausedElapsed = null;
            this.startTime = null;
            console.log(`Timer: Completed mode ${this.mode}`);
            this.eventBus.publish('timerComplete', this.mode);
        }
    }
}