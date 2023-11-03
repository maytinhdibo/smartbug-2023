import fetch from 'node-fetch';
import fs from 'fs';
import cliProgress from 'cli-progress';
import token from './token.json' assert { type: "json" };
import { open } from 'node:fs/promises';



var count = 0;
// const addresses = fs.readFileSync('all_contract.csv').toString().split("\n");

const bar = new cliProgress.SingleBar({
    format: '{percentage}%|{bar}| {value}/{total} [{duration_formatted}/ETA: {eta_formatted}]'
}, cliProgress.Presets.shades_classic);
bar.start(20000000, 0);

const file = await open('./all_contract_1.csv');
    for await (const address of file.readLines()) {
    try{
        const response = await fetch(`https://api.etherscan.io/api?module=contract&action=getsourcecode&address=`
            + address
            + `&apikey=`
            + token.token);
        const data = await response.json();

        if (data.message.toUpperCase() == "OK") {
            if(data.result[0].SourceCode.length > 0){
                fs.writeFileSync("sources/" + address + ".sol", data.result[0].SourceCode);
            }else{
                fs.writeFileSync("error/null_source.csv", address + "\n", { flag: "a+" })
            }
        } else {
            fs.writeFileSync("sources/" + address + ".txt", JSON.stringify(data));
            fs.writeFileSync("error/error.csv", address + "\n========\n", { flag: "a+" })
        }
        bar.update(count++);
    } catch (error) {
        fs.writeFileSync("error/error.csv", address + "\n"+ error +"\n========\n", { flag: "a+" })
    }
}
