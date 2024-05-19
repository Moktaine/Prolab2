//Buttons
const newPatientBtn = document.getElementById("new-patient-btn");
const addPatientBtn = document.getElementById("add-patient-btn");
const editPatientBtn = document.getElementById("edit-patient-btn");

//Patient Input
const input_firstName = document.getElementById("input-firstName");
const input_lastName = document.getElementById("input-lastName");
const input_DoB = document.getElementById("input-DoB");
const input_gender = document.getElementById("input-gender");
const input_phoneNumber = document.getElementById("input-phoneNumber");
const input_adress = document.getElementById("input-adress");


document.addEventListener("DOMContentLoaded", function(){
    fetch("https://localhost:5500/patient/getAllPatients")
    .then(response => response.json())
    .then(data => loadPatientPage(data["data"], 1))
});


//Show inputs for adding new patient
newPatientBtn.onclick = function(){
    const inputSection = document.getElementById("div-input");
    inputSection.style.display = "flex";
    inputSection.hidden = false;
    editPatientBtn.hidden = true;
    addPatientBtn.hidden = false;

    input_firstName.value = "";
    input_lastName.value = "";
    input_DoB.value = "";
    input_gender.value = "";
    input_phoneNumber.value = "";
    input_adress.value = "";
}


//Add new patient to patients table in database
addPatientBtn.onclick = function () {
    fetch("https://localhost:5500/patient/addPatient", {
        headers: {
            "Content-type": "application/json"
        },
        method: "POST",
        body: JSON.stringify(
            {
                firstName: input_firstName.value,
                lastName: input_lastName.value,
                DoB: input_DoB.value,
                gender: input_gender.value,
                phoneNumber: input_phoneNumber.value,
                adress: input_adress.value
            }
        )
    })
    .then(response => response.json())
    .then(data => loadPatientPage(data["data"], document.getElementById("table-patient").dataset.id));
}


function loadPatientPage(data, page){
    createPages(data);
    loadTablePage(page, data);
}

function createPages(data){
    const divPages = document.getElementById("page-div");
    let pagesHtml = "";
    for(let i = 0; i < (data.length / 10); i++){
        pagesHtml += `<button class="page-btn" data-id= ${i+1}>${i+1}</button>`;
    }
    divPages.innerHTML = pagesHtml;
}


document.getElementById("page-div").addEventListener("click", function(e){
    if(e.target.tagName !== "BUTTON") return;

    fetch("https://localhost:5500/patient/getAllPatients")
    .then(response => response.json())
    .then(data => loadTablePage(e.target.dataset.id, data["data"]))
});

function loadTablePage(page, data){
    document.getElementById("table-patient").dataset.id = page;
    let sliceStart = (page-1) * 10;
    let sliceEnd = sliceStart + 10;
    
    const slicedData = data.slice(sliceStart, sliceEnd);

    loadPatientTable(slicedData);
}



//Load the patient table
function loadPatientTable(data){
    const table = document.querySelector("table tbody");

    if(data.length === 0){
        table.innerHTML = "<tr><td class = 'no-patient' colspan = '7'>No Patients</td></tr>";
        return;
    }

    let patientTableHTML = "";

    data.forEach(function({patientId, patientFirstName, patientLastName, dateOfBirth, gender, phoneNumber, adress}){
        patientTableHTML += `<tr id=patient-${patientId}>`;
        patientTableHTML += `<td>${patientId}</td>`;
        patientTableHTML += `<td>${patientFirstName}</td>`;
        patientTableHTML += `<td>${patientLastName}</td>`;
        patientTableHTML += `<td>${new Date(dateOfBirth).toLocaleDateString()}</td>`;
        patientTableHTML += `<td>${gender}</td>`;
        patientTableHTML += `<td>${phoneNumber}</td>`;
        patientTableHTML += `<td>${adress}</td>`;
        patientTableHTML += `<td><button class = "edit-row-btn" data-id=${patientId}>Edit</td>`;
        patientTableHTML += `<td><button class = "delete-row-btn" data-id=${patientId}>Delete</td>`;
        patientTableHTML += `<td><a class="goto-patientProfile" href="/patientProfile/${patientId}" type="button">></a></td>`;
        patientTableHTML += `<tr>`;
    });

    table.innerHTML = patientTableHTML;
}



document.querySelector(`table tbody`).addEventListener('click',
    function(event){
        //Delete
        if(event.target.className === "delete-row-btn"){
            deleteRow(event.target.dataset.id);
        }

        if(event.target.className === "edit-row-btn"){
            getPatientToEdit(event.target.dataset.id);
        }

    }
)

function deleteRow(id){
    fetch("https://localhost:5500/patient/deletePatient/" + id, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => loadPatientPage(data["data"], document.getElementById("table-patient").dataset.id));
}


function getPatientToEdit(id){
    const inputSection = document.getElementById("div-input");
    inputSection.style.display = "flex";
    inputSection.hidden = false;
    editPatientBtn.hidden = false;
    addPatientBtn.hidden = true;
    window.scrollTo(0,0);

    fetch("https://localhost:5500/patient/getPatient/" + id)
    .then(response => response.json())
    .then(data => setEditInputValues(data["data"]));

}

function setEditInputValues(data){
    data = data[0];
    const DoB = formatDate(new Date(data.dateOfBirth));
    
    input_firstName.value = data.patientFirstName;
    input_lastName.value = data.patientLastName;
    input_DoB.value = DoB;
    input_gender.value = data.gender;
    input_phoneNumber.value = data.phoneNumber;
    input_adress.value = data.adress;
    
    editPatientBtn.dataset.id = data.patientId;
}


editPatientBtn.onclick = function(){
    const idToEdit = editPatientBtn.dataset.id;
    console.log(idToEdit);
    fetch("https://localhost:5500/patient/editPatient/" + idToEdit, {
        headers: {
            "Content-type": "application/json"
        },
        method: "PATCH",
        body: JSON.stringify(
            {firstName : input_firstName.value,
            lastName : input_lastName.value,
            DoB : input_DoB.value,
            gender : input_gender.value,
            phoneNumber : input_phoneNumber.value,
            adress : input_adress.value}
        )
    })
    .then(response => response.json())
    .then(data => {
        if(data.success){
            console.log("UPDATE SUCCESSFUL!");
            updatePatientRow(idToEdit, input_firstName.value, input_lastName.value, input_DoB.value,
                input_gender.value, input_phoneNumber.value, input_adress.value);

        }
    })
}


function updatePatientRow(id, firstName, lastName, DoB, gender, phoneNumber, adress){
    const row = document.getElementById(`patient-${id}`);

    let newRowHTML = "";

    newRowHTML += `<td>${id}</td>`;
    newRowHTML += `<td>${firstName}</td>`;
    newRowHTML += `<td>${lastName}</td>`;
    newRowHTML += `<td>${new Date(DoB).toLocaleDateString()}</td>`;
    newRowHTML += `<td>${gender}</td>`;
    newRowHTML += `<td>${phoneNumber}</td>`;
    newRowHTML += `<td>${adress}</td>`;
    newRowHTML += `<td><button class = "edit-row-btn" data-id=${id}>Edit</td>`;
    newRowHTML += `<td><button class = "delete-row-btn" data-id=${id}>Delete</td>`;
    newRowHTML += `<td><a class="goto-patientProfile" href="/patientProfile/${id}" type="button">></a></td>`;
    row.innerHTML = newRowHTML;
}

