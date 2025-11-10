document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start');
    const stopButton = document.getElementById('stop');
    const numBotsInput = document.getElementById('numBots');
    const cooldownInput = document.getElementById('cooldown')
    const ipInput = document.getElementById('ip');
    const portInput = document.getElementById('port');
    const logContainer = document.getElementById('logs');
    const nameInput = document.getElementById('botName');

    startButton.addEventListener('click', () => {
        const numBots = parseInt(numBotsInput.value, 10);
        const cooldown = parseInt(cooldownInput.value, 10);
        const port = parseInt(portInput.value, 10);
        const ip = ipInput.value;
        const botName = nameInput.value;

        window.electron.send('start-bots', { numBots, cooldown, ip, port, botName });
        console.log('Démarrage')
    });

    stopButton.addEventListener('click', () => {
        window.electron.send('stop-bots');
    });

    moveBotsCheckbox.addEventListener('change', () => {
        window.electron.send('toggle-move-bots', moveBotsCheckbox.checked);
    });

    rightClickBotsCheckbox.addEventListener('change', () => {
        window.electron.send('toggle-righ-click-bots', rightClickBotsCheckbox.checked);
    });

    window.electron.on('update-log', (event, logMessage) => {
        const newLog = document.createElement('div');
        newLog.textContent = logMessage;
        logContainer.appendChild(newLog);
        logContainer.scrollTop = logContainer.scrollHeight;
    });
});

