/* timetable-common.js */

let facultyDetails = {};
let subjectDetails = {};

function loadFacultyInfo(data) {
    facultyDetails = {};

    let list = Array.isArray(data) ? data : [];

    if (!list.length && data && typeof data === "object") {
        if (Array.isArray(data.faculty)) list = data.faculty;
        else if (Array.isArray(data.facultyDetails)) list = data.facultyDetails;
        else if (Array.isArray(data.data)) list = data.data;
        else list = Object.values(data).filter(x => x && typeof x === "object");
    }

    list.forEach(faculty => {
        const code = String(
            faculty.FacultyCode ||
            faculty.facultyCode ||
            ""
        ).trim().toUpperCase();

        if (code) facultyDetails[code] = faculty;
    });
}

function loadSubjectInfo(data) {
    subjectDetails = {};

    let list = Array.isArray(data) ? data : [];

    if (!list.length && data && typeof data === "object") {
        if (Array.isArray(data.subjects)) {
            list = data.subjects;
        } else if (Array.isArray(data.subjectDetails)) {
            list = data.subjectDetails;
        } else if (Array.isArray(data.data)) {
            list = data.data;
        } else {
            list = Object.values(data).filter(
                x => x && typeof x === "object" && !Array.isArray(x)
            );
        }
    }

    list.forEach(subject => {
        const acr = String(
            subject.SubjectAcr ||
            subject.subjectAcr ||
            ""
        ).trim().toUpperCase();

        if (acr && !subjectDetails[acr]) {
            subjectDetails[acr] = subject;
        }
    });

    console.log("Subjects loaded:", Object.keys(subjectDetails).length);
    console.log("IKS:", subjectDetails["IKS"]);
}

function initializeTimetableCommon(facultyData, subjectData) {
    loadFacultyInfo(facultyData);
    loadSubjectInfo(subjectData);
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function facultyLink(code){
    code=String(code||"").trim().toUpperCase();
    if(!code) return "";

    return `<span
        class="faculty-code"
        onclick="showFaculty(event,'${escapeHTML(code)}')"
        title="View faculty details">${escapeHTML(code)}
    </span>`;
}

function subjectLink(acr){
    acr=String(acr||"").trim().toUpperCase();
    if(!acr) return "";

    return `<span
        class="subject-code"
        onclick="showSubject(event,'${escapeHTML(acr)}')"
        title="View subject details">${escapeHTML(acr)}
    </span>`;
}
function removeAllPopups(){
    document.querySelectorAll(".subject-popup,.faculty-popup").forEach(popup=>{
        popup.remove();
    });
}

function showFaculty(event,code){
    event.stopPropagation();

    const key=String(code||"").trim().toUpperCase();
    const faculty=facultyDetails[key];

    if(!faculty) return;

    removeAllPopups();

    const popup=document.createElement("div");
    popup.className="faculty-popup";

    popup.innerHTML=`
        <b>Faculty Details</b><br>
        Name: ${escapeHTML(
            faculty.Name||
            faculty.name||
            faculty.FacultyName||
            "Not Available"
        )}<br>
        Department: ${escapeHTML(
            faculty.Department||
            faculty.department||
            "Not Available"
        )}
    `;

    document.body.appendChild(popup);

    const rect=event.target.getBoundingClientRect();

    popup.style.left=(rect.left+window.scrollX)+"px";
    popup.style.top=(rect.top+window.scrollY-popup.offsetHeight-5)+"px";

    setTimeout(()=>{
        document.addEventListener("click",removeFacultyPopup,{once:true});
    },10);
}

function removeFacultyPopup(){
    const popup=document.querySelector(".faculty-popup");

    if(popup){
        popup.remove();
    }
}

function showSubject(event,acr){
    event.stopPropagation();

    const key=String(acr||"").trim().toUpperCase();
    let subject=subjectDetails[key];

    if(!subject){
        const baseAcr=key.replace(/-(L|P|T)$/,"");
        subject=subjectDetails[baseAcr];
    }

    if(!subject) return;

    removeAllPopups();

    const popup=document.createElement("div");
    popup.className="subject-popup";

    popup.innerHTML=`
        <b>Subject Details</b><br>
        Name: ${escapeHTML(subject.SubjectName||"Not Available")}<br>
        Type: ${escapeHTML(getSubjectType(key))}<br>
        Semester: ${escapeHTML(subject.Semester??"Not Available")}
    `;

    document.body.appendChild(popup);

    const rect=event.target.getBoundingClientRect();

    popup.style.left=(rect.left+window.scrollX)+"px";
    popup.style.top=(rect.top+window.scrollY-popup.offsetHeight-5)+"px";

    setTimeout(()=>{
        document.addEventListener("click",removeSubjectPopup,{once:true});
    },10);
}

function removeSubjectPopup(){
    const popup=document.querySelector(".subject-popup");

    if(popup){
        popup.remove();
    }
}

function getSubjectType(acr) {
    const value = String(acr || "").trim().toUpperCase();

    if (value.endsWith("-L")) return "Lecture";
    if (value.endsWith("-P")) return "Practical";
    if (value.endsWith("-T")) return "Tutorial";

    return "Not Available";
}

function showPopup(content) {
    let popup = document.getElementById("commonPopup");

    if (!popup) {
        popup = document.createElement("div");
        popup.id = "commonPopup";
        popup.className = "popup";

        popup.innerHTML = `
            <div class="popup-content">
                <button class="popup-close"
                    onclick="closePopup()">&times;</button>
                <div id="popupBody"></div>
            </div>`;

        document.body.appendChild(popup);
    }

    document.getElementById("popupBody").innerHTML = content;
    popup.style.display = "flex";
}

function closePopup() {
    const popup = document.getElementById("commonPopup");

    if (popup) {
        popup.style.display = "none";
    }
}

document.addEventListener("click", event => {
    const popup = document.getElementById("commonPopup");

    if (popup && event.target === popup) {
        closePopup();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closePopup();
    }
});