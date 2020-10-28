const fs = require('fs');
const iconv = require('iconv-lite');
const INPUT_PATH = __dirname + "/atena.txt"; 
const CONTENTS = "本"; // 内容品 必要ならば変更 正直csvファイルを直接変更したらよいのでは
const LIMIT_ROW_COUNT = 40; // 40行制限のため
  
function main () {
    const atena = fs.readFileSync(INPUT_PATH, "utf8");
    let file_count = 0;
    let row_count = 0;

    let stream = fs.createWriteStream(__dirname + "/files/clickpost_atena" + file_count + ".csv");
    stream.write(iconv.encode("お届け先郵便番号,お届け先氏名,お届け先敬称,お届け先住所1行目,お届け先住所2行目,お届け先住所3行目,お届け先住所4行目,内容品\n", "Shift_JIS"));

    // 変換後csvファイルの一行の一時格納場所
    // お届け先郵便番号,お届け先氏名,お届け先敬称,お届け先住所1行目,お届け先住所2行目,お届け先住所3行目,お届け先住所4行目,内容品の順で格納
    let atena_data = Array(7).fill("");
    let address_tmp = "";
    for (const row of atena.split("\n")) {
        if (row[0] === '〒') {
            atena_data[0] = row.slice(1).trimEnd();
        } else if (row.trimEnd()[row.trimEnd().length - 1] === "様") {
            atena_data[1] = row.trimEnd().substr(0,row.trimEnd().length - 1);
            atena_data[2] = "様";

            address_tmp = address_tmp.replace(/\s+/g, "");
            atena_data[3] = address_tmp.substr(0,20);
            atena_data[4] = address_tmp.substr(20,20);
            atena_data[5] = address_tmp.substr(40,20);
            atena_data[6] = address_tmp.substr(60,20);
            atena_data[7] = CONTENTS;

            stream.write(iconv.encode(atena_data.join(",") + "\n", "Shift_JIS"));
            atena_data.fill("");
            address_tmp = "";
            row_count++;
        } else {
            address_tmp += row;
        }

        if (row_count == LIMIT_ROW_COUNT) {
            stream.end();

            row_count = 0;
            file_count++;
            stream = fs.createWriteStream(__dirname + "/files/clickpost_atena" + file_count + ".csv");
            stream.write(iconv.encode("お届け先郵便番号,お届け先氏名,お届け先敬称,お届け先住所1行目,お届け先住所2行目,お届け先住所3行目,お届け先住所4行目,内容品\n", "Shift_JIS"));
        }
    }

    stream.end();

    stream.on("error", (err)=>{
        if(err)
            console.log(err.message);
        }
    );
}

main();