//Buttons
const newDoctorBtn = document.getElementById("new-doctor-btn");
const addDoctorBtn = document.getElementById("add-doctor-btn");
const editDoctorBtn = document.getElementById("edit-doctor-btn");

//doctor Input
const input_firstName = document.getElementById("input-firstName");
const input_lastName = document.getElementById("input-lastName");
const input_proficiency = document.getElementById("input-proficiency");
const input_hospital = document.getElementById("input-hospital");


document.addEventListener("DOMContentLoaded", function(){
    fetch("https://localhost:5500/doctor/getAllDoctors")
    .then(response => response.json())
    .then(data => loadDoctorPage(data["data"], 1))
});


//Show inputs for adding new doctor
newDoctorBtn.onclick = function(){
    const inputSection = document.getElementById("div-input");
    inputSection.style.display = "flex";
    inputSection.hidden = false;
    editDoctorBtn.hidden = true;
    addDoctorBtn.hidden = false;

    input_firstName.value = "";
    input_lastName.value = "";
    input_proficiency.value = "";
    input_hospital.value = "";
}


//Add new doctor to doctors table in database
addDoctorBtn.onclick = function () {
    fetch("https://localhost:5500/doctor/addDoctor", {
        headers: {
            "Content-type": "application/json"
        },
        method: "POST",
        body: JSON.stringify(
            {
                firstName: input_firstName.value,
                lastName: input_lastName.value,
                proficiency: input_proficiency.value,
                hospital: input_hospital.value,
            }
        )
    })
    .then(response => response.json())
    .then(data => loadDoctorPage(data["data"], document.getElementById("table-doctor").dataset.id));
}


function loadDoctorPage(data, page){
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

    fetch("https://localhost:5500/doctor/getAllDoctors")
    .then(response => response.json())
    .then(data => loadTablePage(e.target.dataset.id, data["data"]))
});

function loadTablePage(page, data){
    document.getElementById("table-doctor").dataset.id = page;
    let sliceStart = (page-1) * 10;
    let sliceEnd = sliceStart + 10;
    
    const slicedData = data.slice(sliceStart, sliceEnd);

    loadDoctorTable(slicedData);
}



//Load the doctor table
function loadDoctorTable(data){
    const table = document.querySelector("table tbody");

    if(data.length === 0){
        table.innerHTML = "<tr><td class = 'no-doctor' colspan = '7'>No doctors</td></tr>";
        return;
    }

    let doctorTableHTML = "";

    data.forEach(function({doctorId, doctorFirstName, doctorLastName, proficiency, hospital}){
        doctorTableHTML += `<tr id=doctor-${doctorId}>`;
        doctorTableHTML += `<td>${doctorId}</td>`;
        doctorTableHTML += `<td>${doctorFirstName}</td>`;
        doctorTableHTML += `<td>${doctorLastName}</td>`;
        doctorTableHTML += `<td>${proficiency}</td>`;
        doctorTableHTML += `<td>${hospital}</td>`;
        doctorTableHTML += `<td><button class = "edit-row-btn" data-id=${doctorId}>Edit</td>`;
        doctorTableHTML += `<td><button class = "delete-row-btn" data-id=${doctorId}>Delete</td>`;
        doctorTableHTML += `<td><a class="goto-doctorProfile" href="/doctorProfile/${doctorId}" type="button">></a></td>`;
        doctorTableHTML += `<tr>`;
    });

    table.innerHTML = doctorTableHTML;
}



document.querySelector(`table tbody`).addEventListener('click',
    function(event){
        //Delete
        if(event.target.className === "delete-row-btn"){
            deleteRow(event.target.dataset.id);
        }

        if(event.target.className === "edit-row-btn"){
            getDoctorToEdit(event.target.dataset.id);
        }

    }
)

function deleteRow(id){
    fetch("https://localhost:5500/doctor/deleteDoctor/" + id, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => loadDoctorPage(data["data"], document.getElementById("table-doctor").dataset.id));
}


function getDoctorToEdit(id){
    const inputSection = document.getElementById("div-input");
    inputSection.style.display = "flex";
    inputSection.hidden = false;
    editDoctorBtn.hidden = false;
    addDoctorBtn.hidden = true;
    window.scrollTo(0,0);

    fetch("https://localhost:5500/doctor/getDoctor/" + id)
    .then(response => response.json())
    .then(data => setEditInputValues(data["data"]));

}

function setEditInputValues(data){
    data = data[0];
    
    input_firstName.value = data.doctorFirstName;
    input_lastName.value = data.doctorLastName;
    input_proficiency.value = data.proficiency;
    input_hospital.value = data.hospital;
    
    editDoctorBtn.dataset.id = data.doctorId;
}


editDoctorBtn.onclick = function(){
    const idToEdit = editDoctorBtn.dataset.id;
    console.log(idToEdit);
    fetch("https://localhost:5500/doctor/editDoctor/" + idToEdit, {
        headers: {
            "Content-type": "application/json"
        },
        method: "PATCH",
        body: JSON.stringify(
            {firstName : input_firstName.value,
            lastName : input_lastName.value,
            proficiency : input_proficiency.value,
            hospital : input_hospital.value}
        )
    })
    .then(response => response.json())
    .then(data => {
        if(data.success){
            console.log("UPDATE SUCCESSFUL!");
            updateDoctorRow(idToEdit, input_firstName.value, input_lastName.value, input_proficiency.value, input_hospital.value);

        }
    })
}


function updateDoctorRow(id, firstName, lastName, proficiency, hospital){
    const row = document.getElementById(`doctor-${id}`);

    let newRowHTML = "";

    newRowHTML += `<td>${id}</td>`;
    newRowHTML += `<td>${firstName}</td>`;
    newRowHTML += `<td>${lastName}</td>`;
    newRowHTML += `<td>${proficiency}</td>`;
    newRowHTML += `<td>${hospital}</td>`;
    newRowHTML += `<td><button class = "edit-row-btn" data-id=${id}>Edit</td>`;
    newRowHTML += `<td><button class = "delete-row-btn" data-id=${id}>Delete</td>`;
    newRowHTML += `<td><a class="goto-doctorProfile" href="/doctorProfile/${id}" type="button">></a></td>`;
    row.innerHTML = newRowHTML;
}

