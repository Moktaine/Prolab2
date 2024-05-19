
var profile_doctor_ID;
var isShowingdoctorInfo = false;
document.addEventListener("DOMContentLoaded", function(){
    profile_doctor_ID = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);

    setDropdownInputs();
});


//SHOW INFO
function getDoctorInfo(){
    fetch("https://localhost:5500/doctor/getDoctor/" + profile_doctor_ID)
    .then(response => response.json())
    .then(data => loadDoctorInfo(data["data"]));
}

function loadDoctorInfo(data){
    const doctorInfoPar = document.getElementById("doctor-info");
    data = data[0];
    
    let doctorInfoHTML = "";

    doctorInfoHTML += `<strong>doctor ID: </strong> ${data.doctorId}`;
    doctorInfoHTML += `<br><strong>First Name: </strong> ${data.doctorFirstName}`; 
    doctorInfoHTML += `<br><strong>Last Name: </strong> ${data.doctorLastName}`;
    doctorInfoHTML += `<br><strong>Proficiency: </strong> ${data.proficiency}`;
    doctorInfoHTML += `<br><strong>Hospital: </strong> ${data.hospital}`;



    doctorInfoPar.innerHTML = doctorInfoHTML;
}

const btn_showInfo = document.getElementById("show-info-btn");

btn_showInfo.onclick = function(){
    if(!isShowingdoctorInfo){
        getDoctorInfo();
        isShowingdoctorInfo = true;
    }else{
        const doctorInfoPar = document.getElementById("doctor-info");
        doctorInfoPar.innerHTML = "";
        isShowingdoctorInfo = false;
    }
}


const btn_showPatients = document.getElementById("show-patients-btn");
btn_showPatients.onclick = function(){
    const appointmentTable = document.getElementById("table-patients");

    if(appointmentTable.hidden){
        appointmentTable.hidden = false;
        loadPatientsOfDoctor();
    }else{
        appointmentTable.hidden = true;
    }
}



function loadPatientsOfDoctor(){
    fetch("https://localhost:5500/doctor/getPatientsOfDoctor/" + profile_doctor_ID)
    .then(response => response.json())
    .then(data => loadPatientsTable(data["data"]));
}


function loadPatientsTable(data){
    console.log(data);
    const table = document.querySelector("#patient-table-div table tbody");

    if(data.length === 0){
        table.innerHTML = "<tr><td class = 'no-patient' colspan = '7'>No Patient</td></tr>";
        return;
    }

    let patientTableHTML = "";

    data.forEach(function({patientId, patientFirstName, patientLastName, dateOfBirth, gender, phoneNumber, adress}){
        patientTableHTML += `<tr>`;
        patientTableHTML += `<td>${patientId}</td>`;
        patientTableHTML += `<td>${patientFirstName} </td>`;
        patientTableHTML += `<td>${patientLastName}</td>`;
        patientTableHTML += `<td>${new Date(dateOfBirth).toLocaleDateString()}</td>`;
        patientTableHTML += `<td>${gender}</td>`;
        patientTableHTML += `<td>${phoneNumber}</td>`;
        patientTableHTML += `<td>${adress}</td>`;
        patientTableHTML += `<td><a class="goto-patientProfile" href="/patientProfile/${patientId}" type="button">></a></td>`;
        patientTableHTML += `<tr>`;
    });

    table.innerHTML = patientTableHTML;
}



///////////////

const btn_showAppointments = document.getElementById("show-appointments-btn");

btn_showAppointments.onclick = function(){
    const appointmentTable = document.getElementById("table-appointments");
    const appointmentInputs = document.getElementById("add-appointment-tab");
    
    if(appointmentTable.hidden){
        appointmentTable.hidden = false;
        appointmentInputs.hidden = false;
        loadDoctorAppointments();
    }else{
        appointmentTable.hidden = true;
        appointmentInputs.hidden = true;
    }
}

const btn_newAppointment = document.getElementById("new-appointment-btn");

btn_newAppointment.onclick = function(){
    const inputDiv = document.getElementById("div-input");
    const btn_addAppointment = document.getElementById("add-appointment-btn");
    const btn_editAppointment = document.getElementById("edit-appointment-btn");
    
    inputDiv.hidden = false;
    inputDiv.style.display = "flex";
    btn_addAppointment.hidden = false;
    btn_editAppointment.hidden = true;

    input_patient.value = "";
    input_doctor.value = "";
    input_date.value = "";
    input_time.value = "";
}



//Table button functionings
document.querySelector(`#appointment-table-div table tbody`).addEventListener('click',
    function(event){
        //Delete
        if(event.target.className === "delete-row-btn"){
            deleteAppointment(event.target.dataset.id);
        }

        if(event.target.className === "edit-row-btn"){
            getAppointmentToEdit(event.target.dataset.id);
        }

    }
)


//DELETE APPOINTMENT
function deleteAppointment(id){
    fetch("https://localhost:5500/appointment/deleteAppointment/" + id, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => loadDoctorAppointments());
}


//EDIT APPOINTMENT

function getAppointmentToEdit(id){
    const inputDiv = document.getElementById("div-input");
    const btn_addAppointment = document.getElementById("add-appointment-btn");
    const btn_editAppointment = document.getElementById("edit-appointment-btn");
    
    inputDiv.hidden = false;
    inputDiv.style.display = "flex";
    btn_addAppointment.hidden = true;
    btn_editAppointment.hidden = false;

    fetch("https://localhost:5500/appointment/getAppointment/" + id)
    .then(response => response.json())
    .then(data => setEditInputValues(data["data"]));
}


const btn_editAppointment = document.getElementById("edit-appointment-btn")

const input_patient = document.getElementById("input-patient");
const input_doctor = document.getElementById("input-doctor");
const input_date = document.getElementById("input-date");
const input_time = document.getElementById("input-time");

function setEditInputValues(data){
    
    const date = formatDate(new Date(data[0].appointmentDate));

    input_patient.value = data[0].patientId;
    input_doctor.value = data[0].doctorId;
    input_date.value = date;
    input_time.value = data[0].appointmentTime;

    btn_editAppointment.dataset.id = data[0].appointmentId;
}

btn_editAppointment.onclick = function(){
    const idToEdit = btn_editAppointment.dataset.id;
    console.log(idToEdit);
    fetch("https://localhost:5500/appointment/editAppointment/" + idToEdit, {
        headers: {
            "Content-type": "application/json"
        },
        method: "PATCH",
        body: JSON.stringify(
            {patientId : input_patient.value,
            doctorId : input_doctor.value,
            date : input_date.value,
            time : input_time.value}
        )
    })
    .then(response => response.json())
    .then(data => {
        if(data.success){
            console.log("UPDATE SUCCESSFUL!");
            loadDoctorAppointments();
        }
    })
}


/////////////

function loadDoctorAppointments(){
    fetch("https://localhost:5500/appointment/getDoctorAppointments/" + profile_doctor_ID)
    .then(response => response.json())
    .then(data => loadAppointmentTable(data["data"]));
}


function loadAppointmentTable(data){
    console.log(data);
    const table = document.querySelector("#appointment-table-div table tbody");

    if(data.length === 0){
        table.innerHTML = "<tr><td class = 'no-appointment' colspan = '7'>No Appointment</td></tr>";
        return;
    }

    let appointmentTableHTML = "";

    data.forEach(function({appointmentId, patientFirstName, patientLastName, doctorFirstName, doctorLastName, appointmentDate, appointmentTime}){
        appointmentTableHTML += `<tr>`;
        appointmentTableHTML += `<td>${appointmentId}</td>`;
        appointmentTableHTML += `<td>${patientFirstName} ${patientLastName}</td>`;
        appointmentTableHTML += `<td>${doctorFirstName} ${doctorLastName}</td>`;
        appointmentTableHTML += `<td>${new Date(appointmentDate).toLocaleDateString()}</td>`;
        appointmentTableHTML += `<td>${appointmentTime}</td>`;
        appointmentTableHTML += `<td><button class = "edit-row-btn" data-id=${appointmentId}>Edit</td>`;
        appointmentTableHTML += `<td><button class = "delete-row-btn" data-id=${appointmentId}>Delete</td>`;
        appointmentTableHTML += `<tr>`;
    });

    table.innerHTML = appointmentTableHTML;
}


//SET Dropdown Input options

function setDropdownInputs(){
    fetch("https://localhost:5500/patient/getAllPatients")
    .then(response => response.json())
    .then(data => setPatientDropdownInput(data["data"]));

    fetch("https://localhost:5500/doctor/getAllDoctors")
    .then(response => response.json())
    .then(data => setDoctorDropdownInput(data["data"]));
}

function setDoctorDropdownInput(data){
    const doctorDropdown = document.getElementById("input-doctor");

    let optionsHTML = "";

    data.forEach(function({doctorId, doctorFirstName, doctorLastName}){
        optionsHTML += `<option value="${doctorId}">${doctorFirstName} ${doctorLastName}</option>`
    })
    doctorDropdown.innerHTML = optionsHTML;
}


function setPatientDropdownInput(data){
    const patientDropdown = document.getElementById("input-patient");

    let optionsHTML = "";

    data.forEach(function({patientId, patientFirstName, patientLastName}){
        optionsHTML += `<option value="${patientId}">${patientId}: ${patientFirstName} ${patientLastName}</option>`
    })
    patientDropdown.innerHTML = optionsHTML;
}



/////////////////////////

const btn_addAppointment = document.getElementById("add-appointment-btn");
//Add new appointment to appointment table in database
btn_addAppointment.onclick = function () {
    const input_patient = document.getElementById("input-patient");
    const input_doctor = document.getElementById("input-doctor");
    const input_date = document.getElementById("input-date");
    const input_time = document.getElementById("input-time");

    fetch("https://localhost:5500/appointment/newAppointment", {
        headers: {
            "Content-type": "application/json"
        },
        method: "POST",
        body: JSON.stringify(
            {
                id: profile_doctor_ID,
                patient: input_patient.value,
                doctor: input_doctor.value,
                date: input_date.value,
                time: input_time.value,
                isPatient: false
            }
        )
    })
    .then(response => response.json())
    .then(data => loadAppointmentTable(data["data"]));
}








///////////////
////REPORTS////
///////////////









const btn_showReports = document.getElementById("show-reports-btn");

btn_showReports.onclick = function(){
    const reportTable = document.getElementById("table-reports");
    const reportInputs = document.getElementById("add-reports-tab");
    
    if(reportTable.hidden){
        reportTable.hidden = false;
        reportInputs.hidden = false;
        getPatients();
    }else{
        reportTable.hidden = true;
        reportInputs.hidden = true;
    }
}


const btn_newReport = document.getElementById("new-report-btn");

btn_newReport.onclick = function(){
    const inputDiv = document.getElementById("div-report-input");
    const btn_addReport = document.getElementById("add-report-btn");
    const inputReport_doctor = document.getElementById("input-report-doctor");
    
    inputDiv.hidden = false;
    inputDiv.style.display = "flex";
    btn_addReport.hidden = false;

    inputReport_doctor.value = "";
}




document.getElementById("btn-submit").onclick = function () {
    this.style.backgroundColor = "red";
};

var fileInput = document.getElementById('fileInput');
var fileInputLabel = document.getElementById('fileInputLabel');

fileInput.addEventListener('change', function () {
    if (fileInput.files.length > 0) {
        fileInputLabel.textContent = fileInput.files[0].name;
    } else {
        fileInputLabel.textContent = 'Select Files';
    }
});

const formElem = document.querySelector('form');
formElem.addEventListener('submit', async (e) => {
    console.log("form submitting");
    e.preventDefault();
    await fetch('https://localhost:5500/report/uploadReport', {
        method: 'POST',
        body: new FormData(formElem)
    })
    .then(response => response.json())
    .then(data => addNewReportToDatabase(data["data"]))
    .catch(error => {
        console.error(error);
    });
});


function addNewReportToDatabase(data){
    console.log(data);
    document.getElementById("btn-submit").style.backgroundColor = "green"
    document.getElementById('fileInputLabel').textContent = "Select Files";
    fetch('https://localhost:5500/report/newRecord',{
        headers: {
            "Content-type": "application/json"
        },
        method:'POST',
        body: JSON.stringify({
            fileId: data,
            patientId: patientReport_input.value,
            doctorId: profile_doctor_ID
        })
    })
    .then(response => response.json())
    .then(response => loadPatientReports())
    .catch(error => console.log(error));
}


function getPatients(){
    fetch("https://localhost:5500/doctor/getPatientsOfDoctor/" + profile_doctor_ID)
    .then(response => response.json())
    .then(data => loadReportPatientInput(data["data"]));
}

const patientReport_input = document.getElementById("input-report-patient");
function loadReportPatientInput(data){
    const input = document.getElementById("input-report-patient");

    let optionsHTML = "";

    data.forEach(function({patientId, patientFirstName, patientLastName}){
        optionsHTML += `<option value="${patientId}">${patientFirstName} ${patientLastName}</option>`
    })
    input.innerHTML = optionsHTML;
}


patientReport_input.addEventListener("change", function(){
    loadPatientReports();
})



function loadPatientReports() {
    fetch("https://localhost:5500/report/getPatientReports/" + patientReport_input.value)
        .then(response => response.json())
        .then(data => loadReportTable(data["data"]));
}


function loadReportTable(data) {
    console.log(data);
    const table = document.querySelector("#reports-table-div table tbody");

    if (data.length === 0) {
        table.innerHTML = "<tr><td class = 'no-report' colspan = '7'>No Report</td></tr>";
        return;
    }

    let appointmentTableHTML = "";

    data.forEach(function ({ recordId, patientFirstName, patientLastName, doctorFirstName, doctorLastName, recordDate, recordURL }) {
        appointmentTableHTML += `<tr>`;
        appointmentTableHTML += `<td>${recordId}</td>`;
        appointmentTableHTML += `<td>${patientFirstName} ${patientLastName}</td>`;
        appointmentTableHTML += `<td>${doctorFirstName} ${doctorLastName}</td>`;
        appointmentTableHTML += `<td>${new Date(recordDate).toLocaleString()}</td>`;
        appointmentTableHTML += `<td><a href="${recordURL}" target="_blank">${recordURL}</a></td>`;
        appointmentTableHTML += `<td><button class = "delete-row-btn" data-id=${recordId}>Delete</td>`;
        appointmentTableHTML += `<tr>`;
    });

    table.innerHTML = appointmentTableHTML;
}


document.querySelector(`#reports-table-div table tbody`).addEventListener('click',
    function(event){
        //Delete
        if(event.target.className === "delete-row-btn"){
            deleteReport(event.target.dataset.id);
        }

    }
)


//DELETE REPORT
function deleteReport(id){
    fetch("https://localhost:5500/report/deleteReport/" + id, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => loadPatientReports());
}