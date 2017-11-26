const xlsx = require("xlsx");
const fs = require('fs');
const jsonfile = require("jsonfile");
const lodash = require("lodash");
const { teiMapping } = require("./config.json");
const { generateUid } = require("./utils");

let patientFileList = fs.readdirSync("./input/patient/");
let teiList = {
    trackedEntityInstances: []
};

let teiEnrollmentMapping = {};

patientFileList.forEach(fileName => {
    let workbook = xlsx.readFile("./input/patient/" + fileName);
    let ou = fileName.split("_")[0];
    let worksheet = workbook.Sheets[workbook.SheetNames[0]];
    let patientList = xlsx.utils.sheet_to_json(worksheet);
    patientList.forEach(patient => {
        let tei = {
            trackedEntity: "aRi1q4QBlXC",
            orgUnit: ou,
            trackedEntityInstance: generateUid(),
            attributes: [{
                lastUpdated: "2017-11-26T10:09:50.417",
                storedBy: "em",
                code: "HIVCPatient7",
                displayName: "HIV-CAM Patient - Age",
                created: "2017-11-26T10:09:50.417",
                valueType: "NUMBER",
                attribute: "ydPUz31C9oL",
                value: "1"
            }]
        };
        Object.keys(teiMapping).forEach(column => {
            tei.attributes.push({
                attribute: teiMapping[column],
                value: patient[column]
            })
        });
        teiList.trackedEntityInstances.push(tei);
    });
});

jsonfile.writeFileSync("./output/tei.json", teiList);