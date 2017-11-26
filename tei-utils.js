const xlsx = require("xlsx");
const fs = require('fs');
const jsonfile = require("jsonfile");
const _ = require("lodash");

const { teiMapping, Investigation } = require("./config.json");
const { generateUid } = require("./utils");


const generateTeiEnrEvent = () => {
    let patientFileList = fs.readdirSync("./input/patient/");
    let teiList = [];
    let enrList = {
        enrollments: []
    };
    let teiEnrMapping = {};
    let eventList = [];

    let teiEnrollmentMapping = {};

    patientFileList.forEach(fileName => {
        let workbook = xlsx.readFile("./input/patient/" + fileName);
        let ou = fileName.split("_")[0];
        let worksheet = workbook.Sheets[workbook.SheetNames[0]];
        let patientList = xlsx.utils.sheet_to_json(worksheet);
        patientList.forEach(patient => {
            let teiId = generateUid();
            let enrId = generateUid();
            let eventId = generateUid();

            ////////////////Generate TEI///////////////
            ///////////////////////////////////////////
            let tei = {
                trackedEntity: "aRi1q4QBlXC",
                orgUnit: ou,
                trackedEntityInstance: teiId,
                attributes: []
            };
            Object.keys(teiMapping).forEach(column => {
                if (patient.hasOwnProperty(column)) {
                    tei.attributes.push({
                        attribute: teiMapping[column],
                        value: patient[column] + ""
                    });
                }
            });
            teiList.push(tei);
            ///////////////////////////////////////////
            ///////////////////////////////////////////


            ////////////////Generate Enrollment////////
            ///////////////////////////////////////////
            let enr = {
                orgUnit: "qJzrmj5CTmC",
                program: "ugLbPc9sYjQ",
                enrollment: enrId,
                trackedEntityInstance: teiId,
                enrollmentDate: "2017-11-26",
            }
            enrList.enrollments.push(enr);
            ///////////////////////////////////////////
            ///////////////////////////////////////////

            //Generate TEI & Enrollment Mapping////////
            ///////////////////////////////////////////
            teiEnrMapping[patient.PatientID] = {
                tei: teiId,
                enr: enrId
            }
            ///////////////////////////////////////////
            ///////////////////////////////////////////

            ////////////////Generate Event/////////////
            ///////////////////////////////////////////
            let event = {
                program: "ugLbPc9sYjQ",
                event: eventId,
                programStage: "jNH9CMNG2cP",
                orgUnit: ou,
                trackedEntityInstance: teiId,
                enrollment: enrId,
                eventDate: "2017-11-26T00:00:00.000",
                dataValues: []
            }
            Object.keys(Investigation).forEach(column => {
                if (patient.hasOwnProperty(column)) {
                    event.dataValues.push({
                        dataElement: Investigation[column],
                        value: patient[column] + ""
                    });
                }
            });
            eventList.push(event);
            ///////////////////////////////////////////
            ///////////////////////////////////////////

        });
    });

    teiList = _.chunk(teiList, 5000);
    eventList = _.chunk(eventList, 5000);
    let teiIndex = 1;
    let eventIndex = 1;

    teiList.forEach(list => {
        jsonfile.writeFileSync(`./output/tei-${teiIndex}.json`, { trackedEntityInstances: list });
        teiIndex += 1;
    });

    eventList.forEach(list => {
        jsonfile.writeFileSync(`./output/event-Investigation-${eventIndex}.json`, { events: list });
        eventIndex += 1;
    });

    jsonfile.writeFileSync(`./output/enrollment.json`, enrList);
    jsonfile.writeFileSync(`./teiEnrMapping.json`, teiEnrMapping);
};
module.exports = {
    generateTeiEnrEvent
}


