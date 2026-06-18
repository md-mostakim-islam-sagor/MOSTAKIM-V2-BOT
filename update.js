try {
        var { existsSync, writeFileSync, removeSync, mkdirSync, copySync, readdirSync, createWriteStream } = require("fs-extra"),
                        axios = require("axios"),
                        extract = require("extract-zip"),
                        exec = require('child_process').exec;
} catch { return console.error("[!] Required packages for the update are not installed. Run this command in cmd/terminal: 'npm install --save fs-extra axios extract-zip child_process'"); }

try {
        var configValue = require("./config.json");
        console.log("Config file found");
}
catch (error) {
if (error) return console.log("Bot config file not found!");
}

(async () => {
        try {
                console.log("====== PLEASE DO NOT CLOSE THIS CMD/TERMINAL UNTIL THE UPDATE IS COMPLETED ======");
                await backup(configValue);
                await clone();
                await clean();
        await unzip();
                await install();
                await modules();
                await finish(configValue);
        } catch (e) { console.log(e) }
})();

async function backup(configValue) {
        console.log('-> Removing old backup');
        removeSync(process.cwd() + '/MAIN/tmp');
        console.log('-> Backing up data');
        mkdirSync(process.cwd() + '/MAIN/tmp');
    mkdirSync(process.cwd() + '/MAIN/tmp/main')
        if (existsSync('./MOSTAKIM')) copySync('./MOSTAKIM', './MAIN/tmp/MOSTAKIM');
        if (existsSync(`./${configValue.APPSTATEPATH}`)) copySync(`./${configValue.APPSTATEPATH}`, `./MAIN/tmp/${configValue.APPSTATEPATH}`);
        if (existsSync('./config.json')) copySync('./config.json', './MAIN/tmp/config.json');
        if (existsSync(`./${configValue.DATABASE.sqlite.storage}`)) copySync(`./${configValue.DATABASE.sqlite.storage}`, `./MAIN/tmp/${configValue.DATABASE.sqlite.storage}`);
}

async function clean() {
        console.log('-> Removing old version');
        readdirSync('.').forEach(item => { if (item != 'MAIN') removeSync(item); });
}

async function clone() {
        console.log('-> Downloading latest update');
        const response = await axios({
                method: 'GET',
                url: "https://github.com/mostakim-sagor/MOSTAKIM-V2-BOT/archive/refs/heads/main.zip",
                responseType: "stream"
        });

        const writer = createWriteStream('./MAIN/tmp/main.zip');

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', (e) => reject('[!] Failed to download the update [!] ' + e));
        });
}

function unzip() {
        console.log('-> Extracting latest update');
        return extract('./MAIN/tmp/main.zip', { dir: process.cwd() + '/MAIN/tmp/main' }, (error) => {
                console.log(error);
        if (error) throw new Error(error);
        else return;
        });
}

function install () {
    console.log('-> Installing latest update');
    copySync(process.cwd() + '/MAIN/tmp/main/MOSTAKIM-V2-BOT-main/', './');
    return;
}

function modules() {
        return new Promise(function (resolve, reject) {
                console.log('-> Installing modules');
                let child = exec('npm install');
                child.stdout.on('end', resolve);
                child.stderr.on('data', data => {
                        if (data.toLowerCase().includes('error')) {
                                console.error('[!] An error occurred. Please create an issue and send the updateError.log file on Github [!]');
                                data = data.replace(/\r?\n|\r/g, '');
                                writeFileSync('updateError.log', data);
                                console.log("[!] Module installation process stopped due to an error. Please install the modules manually. Continuing the final steps [!]");
                                resolve();
                        }
                });
        });
}

async function finish(configValue) {
        console.log('-> Finishing update');
        if (existsSync(`./MAIN/tmp/${configValue.APPSTATEPATH}`)) copySync(`./MAIN/tmp/${configValue.APPSTATEPATH}`, `./${configValue.APPSTATEPATH}`);
        if (existsSync(`./MAIN/tmp/${configValue.DATABASE.sqlite.storage}`)) copySync(`./MAIN/tmp/${configValue.DATABASE.sqlite.storage}`, `./${configValue.DATABASE.sqlite.storage}`);
        if (existsSync('./MAIN/tmp/newVersion')) removeSync('./MAIN/tmp/newVersion');
        console.log('>> Update completed successfully <<');
        console.log('>> ALL IMPORTANT DATA HAS BEEN BACKED UP INSIDE THE "MAIN/tmp" FOLDER <<');
        return process.exit(0);
}