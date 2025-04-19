class NotificationManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.settings = null;
        this.eventBus.subscribe('settingsLoaded', (settings) => {
            this.settings = settings;
        });
        this.eventBus.subscribe('settingsSaved', (settings) => {
            this.settings = settings;
        });
        this.eventBus.subscribe('timerComplete', (mode) => this.showNotification(mode));
    }

    showNotification(mode) {
        console.log(`NotificationManager: Showing notification for ${mode}`);
        const sound = mode === 'pomodoro' ? document.getElementById('work-end') : document.getElementById('break-end');
        sound.currentTime = 0;
        sound.loop = true;
        const playPromise = sound.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => console.error("Audio playback error:", error));
        }

        const message = mode === 'pomodoro' ? 'Время работы истекло! Пора сделать перерыв.' : 'Перерыв окончен! Пора вернуться к работе.';
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <p>${message}</p>
                <button class="close-notification">Закрыть</button>
            </div>
        `;
        document.body.appendChild(notification);
        console.log('NotificationManager: Notification appended to DOM');
        setTimeout(() => notification.classList.add('show'), 10);

        const duration = (this.settings && this.settings.notificationDuration) ? this.settings.notificationDuration * 1000 : 30000;
        const closeTimer = setTimeout(() => this.closeNotification(notification, mode), duration);
        notification.querySelector('.close-notification').addEventListener('click', () => {
            clearTimeout(closeTimer);
            this.closeNotification(notification, mode);
        });
    }

    closeNotification(notification, mode) {
        const sound = mode === 'pomodoro' ? document.getElementById('work-end') : document.getElementById('break-end');
        sound.loop = false;
        sound.pause();
        sound.currentTime = 0;
        notification.remove();
        console.log('NotificationManager: Notification closed');
        this.eventBus.publish('notificationClosed', mode);
    }
}