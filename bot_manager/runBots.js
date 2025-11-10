const { Worker, parentPort } = require('worker_threads');
const mc = require('minecraft-protocol');

let stopRequested = false;
const botThreads = [];
let moveBots = false;
let makeRightClick = false;

function startBots(config) {
    function createBotWithCooldown(botId, delay) {
        setTimeout(() => {
            const worker = new Worker('./bot_manager/botThread.js', {
                workerData: { botId, host: config.host, port: config.port, botName: config.botName }
            });

            worker.on('message', (message) => {
                global.logFunction(`Message du bot ${botId}: ${message}`);
            });
    
            worker.on('error', (error) => {
                global.logFunction(`Erreur avec le bot ${botId}:`, error);
            });
    
            worker.on('exit', (code) => {
                if (code !== 0 && !stopRequested) {
                    global.logFunction(`Le bot ${botId} s'est terminé avec le code ${code}. Redémarrage...`);
                    createBotWithCooldown(botId, 0);
                } else if (stopRequested) {
                    global.logFunction(`Le bot ${botId} ne sera pas redémarré car un arrêt global a été demandé.`);
                }
            });
    
            botThreads.push(worker);
        }, delay);
    }
    
    function stopAllBots() {
        stopRequested = true;
        botThreads.forEach(worker => worker.terminate());
        global.logFunction('Tous les bots ont été arrêtés.');
    }
    
    process.on('SIGINT', stopAllBots);
    process.on('SIGTERM', stopAllBots);
    
    isServerOnline(config.host, config.port, (online) => {
        if (online) {
            global.logFunction('Le serveur est en ligne. Lancement des bots...');
            for (let i = 1; i <= config.numBots; i++) {
                const delay = (i - 1) * config.cooldown;
                createBotWithCooldown(i, delay);
            }
        } else {
            global.logFunction('Le serveur est hors ligne. Arrêt du programme.');
        }
    });

    return stopAllBots;

}

function isServerOnline(host, port, callback) {
    const client = mc.ping({ host, port }, (err, result) => {
        callback(!err && result);
    });
}

function moveBotsRandomly() {
    botThreads.forEach((worker) => {
        worker.postMessage({ action: 'moveRandomly' });
    });
}

function makeBotsJump() {
    botThreads.forEach((worker) => {
        worker.postMessage({ action: 'makeJump' });
    });
}

function makeBotsRightClick() {
    botThreads.forEach((worker) => {
        worker.postMessage({ action: 'makeRightClick' });
    });
}

function setMoveBots(status) {
    moveBots = status;
    global.logFunction(`Mouvements des bots ${status ? 'activés' : 'désactivés'}`);
}

function setRightClick(status) {
    makeRightClick = status;
    global.logFunction(`Clic droit des bots ${status ? 'activés' : 'désactivés'}`);
}


setInterval(() => {
    if (moveBots) {
        moveBotsRandomly();
    }
}, 1000);

setInterval(() => {
    if (moveBots) {
        makeBotsJump();
    }
}, 1000);

setInterval(() => {
    if (makeRightClick) {
        makeBotsRightClick();
    }
}, 7000);


module.exports = { startBots, setMoveBots, setRightClick  };