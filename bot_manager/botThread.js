const { parentPort, workerData } = require('worker_threads');
const mineflayer = require('mineflayer');

const { botId, host, port, botName } = workerData;


function createBot() {
    const bot = mineflayer.createBot({
        host: host,
        port: port,
        username: `${botName}_${botId}`,
        version: '1.8.9'
    });

    function moveRandomly() {
        const directions = ['forward', 'back', 'left', 'right'];
        const randomDirection = directions[Math.floor(Math.random() * directions.length)];
        
        bot.setControlState(randomDirection, true);

        setTimeout(() => {
            bot.setControlState(randomDirection, false);
        }, Math.random() * 2000 + 1000);  // Délais entre 1 et 3 secondes
    }

    function makeBotJump() {
        bot.setControlState('jump', true);

        // Arrêter de sauter après un délai
        setTimeout(() => {
            bot.setControlState('jump', false);
        }, 500);  // Le bot saute pendant 0.5 seconde
    }

    function simulateRightClick(){
        parentPort.postMessage(`CLICCCC`);
        bot.activateItem();
    }

    bot.on('spawn', () => {
        parentPort.postMessage(`${botName} a été connecté avec succès!`);
    });

    bot.on('error', (err) => {
        console.error(`Erreur dans ${botName}:`, err);
        parentPort.postMessage(`Erreur avec ${botName}`);
    });

    bot.on('end', () => {
        console.log(`${botName} est déconnecté.`);
        parentPort.postMessage(`${botName} est déconnecté.`);
    });

    parentPort.on('message', (message) => {
        if (message.action === 'moveRandomly') {
            moveRandomly();
        } else if (message.action === 'makeJump') {
            makeBotJump();
        } else if (message.action === 'makeRightClick') {
            simulateRightClick();
        }
    });
}

createBot();