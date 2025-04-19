class ModeManager {
    constructor(eventBus, settings) {
        this.eventBus = eventBus;
        this.settings = settings;
        this.currentMode = 'pomodoro';
        this.eventBus.publish('modeSwitched', this.currentMode);

        this.eventBus.subscribe('switchMode', (newMode) => this.switchMode(newMode));
        this.eventBus.subscribe('notificationClosed', (completedMode) => {
            if (this.settings.autoSwitch) {
                const nextMode = this.getNextMode(completedMode);
                console.log(`ModeManager: Auto-switching to ${nextMode}`);
                this.switchMode(nextMode);
                this.eventBus.publish('startTimer');
            }
        });
        this.eventBus.subscribe('settingsSaved', (newSettings) => {
            this.settings = newSettings;
        });
    }

    getNextMode(currentMode) {
        return currentMode === 'pomodoro' ? 'shortBreak' : 'pomodoro';
    }

    switchMode(newMode) {
        console.log(`ModeManager: Switching to ${newMode}`);
        this.currentMode = newMode;
        this.eventBus.publish('modeSwitched', newMode);
    }
}