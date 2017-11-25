let XLSX = require('xlsx');
const jsonwrite = require("jsonfile");
let workbook = XLSX.readFile(`./.xlsx`);
const excelContent = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);


let event = {};
event["events"] = [];

const generateEventsNghia = (data) => {
    excelContent.forEach(exc => {

        event["events"].push(createEventObject(exc,data));
        createJsonFile();

    });
}



const createJsonFile = () => {
    jsonwrite.writeFileSync(`./AfterUpdate.json`, event);
}

const createEventObject = (exc, data) => {

    let temp;
    if (data.hasOwnProperty(exc.PatientID)) {
        temp = {
            "programStage": config[nameofExcelfile.split()].programStageId,
            "orgUnit": nameofExcelfile.split(),
            "program": "",
            "trackedEntityInstance": data[exc.PatientID].trackedEntityInstance,
            "enrollment": data[exc.PatientID].Enrollment,
            "status": "COMPLETED",
            "eventDate": "",
            "followup": true,
            "dataValues": []
        }

        for (z in exc) {
            const dataval = {
                "dataElement": config[nameofExcelfile.split()][z],
                "value": exc[z]
            };
            temp.dataValues.push(dataval);
        }

        return temp;
    }

}

modules.export = {
    generateEventsNghia
}