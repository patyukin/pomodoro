class SettingsManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        const savedSettings = JSON.parse(localStorage.getItem('pomodoroSettings') || '{}');
        this.settings = {
            pomodoro: savedSettings.pomodoro || 25,
            shortBreak: savedSettings.shortBreak || 5,
            longBreak: savedSettings.longBreak || 15,
            autoSwitch: savedSettings.autoSwitch !== undefined ? savedSettings.autoSwitch : true,
            notificationDuration: savedSettings.notificationDuration || 30 // Default 30 seconds
        };
        console.log('SettingsManager: Loaded settings', this.settings);
        this.eventBus.publish('settingsLoaded', this.settings);

        this.eventBus.subscribe('saveSettings', (newSettings) => this.saveSettings(newSettings));
    }

    saveSettings(newSettings) {
        if (newSettings.pomodoro > 0 && newSettings.shortBreak > 0 && newSettings.longBreak > 0) {
            this.settings = newSettings;
            localStorage.setItem('pomodoroSettings', JSON.stringify(newSettings));
            console.log('SettingsManager: Saved settings', newSettings);
            this.eventBus.publish('settingsSaved', newSettings);
        }
    }
}