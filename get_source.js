import fetch from 'node-fetch';
import fs from 'fs';
import cliProgress from 'cli-progress';
import token from './token.json' assert { type: "json" };


var count = 0;
const addresses = fs.readFileSync('all_contract.csv').toString().split("\n");

const bar = new cliProgress.SingleBar({
    format: '{percentage}%|{bar}| {value}/{total} [{duration_formatted}/ETA: {eta_formatted}]'
}, cliProgress.Presets.shades_classic);
bar.start(addresses.length, 0);

for (const address of addresses) {
    // const address = addresses[i];
    const response = await fetch(`https://api.etherscan.io/api?module=contract&action=getsourcecode&address=`
        + address
        + `&apikey=`
        + token.token);
    const data = await response.json();

    if (data.message.toUpperCase() == "OK") {
        if(data.result[0].SourceCode.length>0){
            fs.writeFileSync("sources/" + address + ".sol", data.result[0].SourceCode);
        }else{
            fs.writeFileSync("error/null_source.csv", address + "\n", { flag: "a+" })
        }
    } else {
        fs.writeFileSync("sources/" + address + ".txt", JSON.stringify(data));
        fs.writeFileSync("error/error.csv", address + "\n", { flag: "a+" })
    }
    bar.update(count++);
}