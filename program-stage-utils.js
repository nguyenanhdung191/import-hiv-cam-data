const xlsx = require("xlsx");
const fs = require('fs');
const jsonfile = require("jsonfile");
const _ = require("lodash");
const moment = require('moment');
let arrayFolder = ["followup", "medicine", "notification", "staging"];
const { generateUid } = require("./utils");

const createEventObject = (exc, data, eventId, ou, stagename) => {

    let config = require("./config.json");
    let stagenameConfig = config[stagename];

    let temp;
    if (data.hasOwnProperty(exc.PatientID)) {
        temp = {
            "programStage": stagenameConfig.programStageId,
            "orgUnit": ou,
            "program": "ugLbPc9sYjQ",
            "trackedEntityInstance": data[exc.PatientID].tei,
            "enrollment": data[exc.PatientID].enr,
            "status": "COMPLETED",
            "eventDate": "2017-11-27T00:00:00.000",
            "followup": true,
            "dataValues": []
        }

        Object.keys(stagenameConfig).forEach(column => {
            if (exc.hasOwnProperty(column)) {
                if (stagenameConfig[column].valueType === "BOOLEAN") {
                    if (exc[column].toString() !== "0") {
                        temp.dataValues.push({
                            dataElement: stagenameConfig[column].id,
                            value: exc[column].toString()
                        });
                    }
                } else {
                    if (stagenameConfig[column].valueType === "DATE") {

                        if (exc[column].toString() !== "") {
                            let day = exc[column].split("/")[0];
                            let month = exc[column].split("/")[1];
                            let year = exc[column].split("/")[2];
                            let value = moment(`${day}-${month}-${year}`).format("YYYY-MM-DD");
                            temp.dataValues.push({
                                dataElement: stagenameConfig[column].id,
                                value: value
                            });
                        }

                    } else {
                        temp.dataValues.push({
                            dataElement: stagenameConfig[column].id,
                            value: exc[column].toString()
                        });
                    }
                }
            }
        });

        return temp;
    }

}


const generate4StagesEvent = () => {
    const data = require("./teiEnrMapping.json");

    for (let i = 0; i <= 3; i++) {
        let stageFileList = fs.readdirSync(`./input/${arrayFolder[i]}`);

        stageFileList.forEach(stage => {
            let workbook = xlsx.readFile(`./input/${arrayFolder[i]}/${stage}`);
            let ou = stage.split("_")[0];
            let stagename = stage.split("_")[1];
            stagename = stagename.split(".")[0];
            let worksheet = workbook.Sheets[workbook.SheetNames[0]];
            let stageList = xlsx.utils.sheet_to_json(worksheet);
            let event = [];

            stageList.forEach(sl => {
                let eventId = generateUid();
                event.push(createEventObject(sl, data, eventId, ou, stagename));
            })
            event = _.chunk(event, 5000);
            let eventIndex = 1;
            event.forEach(list => {
                jsonfile.writeFileSync(`./output/${arrayFolder[i]}/${stage}_output_${eventIndex}.json`, { events: list });
                eventIndex += 1;
            });

        });
    }
};

module.exports = {
    generate4StagesEvent
}


