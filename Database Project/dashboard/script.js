document.addEventListener('DOMContentLoaded', function() {
    loadStudentsFromStorage();
    loadStudents();
    setupEventListeners();
});

function logout() {
    console.log('Logout called, but login is disabled in this build.');
}

let students = [];

function loadStudentsFromStorage() {
    const stored = localStorage.getItem('studentsData');
    if (stored) {
        students = JSON.parse(stored);
    } else {
        students = [
            { id: 1001, name: "John Smith", email: "john.smith@school.edu", grade: "Grade 10", date: "2023-09-01", status: "Active", phone: "555-0101", dob: "2008-05-15" },
            { id: 1002, name: "Emma Johnson", email: "emma.j@school.edu", grade: "Grade 11", date: "2023-09-01", status: "Active", phone: "555-0102", dob: "2007-03-22" },
            { id: 1003, name: "Michael Brown", email: "michael.b@school.edu", grade: "Grade 9", date: "2023-09-01", status: "Active", phone: "555-0103", dob: "2009-07-30" },
            { id: 1004, name: "Sarah Davis", email: "sarah.d@school.edu", grade: "Grade 12", date: "2023-09-01", status: "Graduated", phone: "555-0104", dob: "2006-11-12" },
            { id: 1005, name: "David Wilson", email: "david.w@school.edu", grade: "Grade 10", date: "2023-09-01", status: "Active", phone: "555-0105", dob: "2008-01-08" }
        ];
        saveStudentsToStorage();
    }
}

function saveStudentsToStorage() {
    localStorage.setItem('studentsData', JSON.stringify(students));
}

function setupEventListeners() {
    const studentForm = document.getElementById('studentForm');
    const editForm = document.getElementById('editForm');
    if (studentForm) studentForm.addEventListener('submit', handleAddStudent);
    if (editForm) editForm.addEventListener('submit', handleEditStudent);
    const searchInput = document.getElementById('studentSearch');
    const gradeFilter = document.getElementById('gradeFilter');
    const statusFilter = document.getElementById('statusFilter');
    if (searchInput) searchInput.addEventListener('keyup', performSearch);
    if (gradeFilter) gradeFilter.addEventListener('change', performSearch);
    if (statusFilter) statusFilter.addEventListener('change', performSearch);
}

function showSection(section) {
    document.getElementById('students-section').style.display = 'none';
    document.getElementById('teachers-section').style.display = 'none';
    document.getElementById('courses-section').style.display = 'none';
    document.getElementById('attendance-section').style.display = 'none';
    document.getElementById('grades-section').style.display = 'none';
    const sectionElement = document.getElementById(section + '-section');
    if (sectionElement) sectionElement.style.display = 'block';
    const titles = {
        'students': 'Student Management',
        'teachers': 'Teacher Management',
        'courses': 'Course Management',
        'attendance': 'Attendance Tracking',
        'grades': 'Grades Management'
    };
    document.getElementById('page-title').textContent = titles[section] || 'Dashboard';
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    if (event && event.currentTarget) event.currentTarget.classList.add('active');
}

// ===========================
// LOAD & DISPLAY STUDENTS
// ===========================

function loadStudents(dataToDisplay = students) {
    const tbody = document.getElementById('students-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (dataToDisplay.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 30px;">No students found</td></tr>';
        return;
    }
    
    dataToDisplay.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${escapeHtml(student.name)}</td>
            <td>${escapeHtml(student.email)}</td>
            <td>${student.grade}</td>
            <td>${formatDate(student.date)}</td>
            <td><span class="status-badge ${student.status.toLowerCase()}">${student.status}</span></td>
            <td class="action-cell">
                <button class="action-btn view-btn" onclick="viewStudent(${student.id})" title="View">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="action-btn edit-btn" onclick="openEditStudentForm(${student.id})" title="Edit">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="action-btn delete-btn" onclick="deleteStudent(${student.id})" title="Delete">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Update total students count
    document.getElementById('total-students').textContent = students.length.toLocaleString();
}

// ===========================
// FORM HANDLERS - ADD STUDENT
// ===========================

function openAddStudentForm() {
    const form = document.getElementById('addStudentForm');
    if (form) {
        form.style.display = 'flex';
        document.getElementById('studentForm').reset();
        clearFormErrors();
    }
}

function closeAddStudentForm() {
    const form = document.getElementById('addStudentForm');
    if (form) {
        form.style.display = 'none';
    }
}

function handleAddStudent(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('studentName').value.trim();
    const email = document.getElementById('studentEmail').value.trim();
    const grade = document.getElementById('studentGrade').value;
    const phone = document.getElementById('studentPhone').value.trim();
    const dob = document.getElementById('studentDob').value;
    const address = document.getElementById('studentAddress').value.trim();

    // Validate form
    if (!validateStudentForm(name, email, grade)) {
        return;
    }

    // Create new student object
    const newStudent = {
        id: generateStudentId(),
        name: name,
        email: email,
        grade: grade,
        date: new Date().toISOString().split('T')[0],
        status: 'Active',
        phone: phone,
        dob: dob,
        address: address
    };
    
    // Add to array and save
    students.push(newStudent);
    saveStudentsToStorage();
    loadStudents();
    closeAddStudentForm();
    showAlert('Student added successfully!', 'success');
}

// ===========================
// FORM HANDLERS - EDIT STUDENT
// ===========================

function openEditStudentForm(studentId) {
    const student = students.find(s => s.id === studentId);
    if (student) {
        document.getElementById('editStudentId').value = student.id;
        document.getElementById('editStudentName').value = student.name;
        document.getElementById('editStudentEmail').value = student.email;
        document.getElementById('editStudentGrade').value = student.grade;
        document.getElementById('editStudentStatus').value = student.status;
        document.getElementById('editStudentForm').style.display = 'flex';
        clearFormErrors();
    }
}

function closeEditStudentForm() {
    const form = document.getElementById('editStudentForm');
    if (form) {
        form.style.display = 'none';
    }
}

function handleEditStudent(e) {
    e.preventDefault();
    
    const studentId = parseInt(document.getElementById('editStudentId').value);
    const name = document.getElementById('editStudentName').value.trim();
    const email = document.getElementById('editStudentEmail').value.trim();
    const grade = document.getElementById('editStudentGrade').value;
    const status = document.getElementById('editStudentStatus').value;

    // Validate form
    if (!validateStudentForm(name, email, grade)) {
        return;
    }

    const studentIndex = students.findIndex(s => s.id === studentId);
    
    if (studentIndex !== -1) {
        students[studentIndex].name = name;
        students[studentIndex].email = email;
        students[studentIndex].grade = grade;
        students[studentIndex].status = status;
        
        saveStudentsToStorage();
        loadStudents();
        closeEditStudentForm();
        showAlert('Student updated successfully!', 'success');
    }
}

// ===========================
// DELETE & VIEW FUNCTIONS
// ===========================

function deleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
        students = students.filter(student => student.id !== studentId);
        saveStudentsToStorage();
        loadStudents();
        showAlert('Student deleted successfully!', 'success');
    }
}

function viewStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (student) {
        alert(`Student Details:\n\nID: ${student.id}\nName: ${student.name}\nEmail: ${student.email}\nGrade: ${student.grade}\nStatus: ${student.status}\nPhone: ${student.phone || 'N/A'}\nDate of Birth: ${student.dob || 'N/A'}`);
    }
}

// ===========================
// SEARCH & FILTER
// ===========================

function performSearch() {
    const searchTerm = (document.getElementById('studentSearch')?.value || '').toLowerCase();
    const gradeFilter = document.getElementById('gradeFilter')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';

    const filtered = students.filter(student => {
        const matchesSearch = !searchTerm || 
            student.name.toLowerCase().includes(searchTerm) ||
            student.email.toLowerCase().includes(searchTerm) ||
            student.id.toString().includes(searchTerm);
        
        const matchesGrade = !gradeFilter || student.grade === gradeFilter;
        const matchesStatus = !statusFilter || student.status === statusFilter;
        
        return matchesSearch && matchesGrade && matchesStatus;
    });

    loadStudents(filtered);
}

// ===========================
// EXPORT FUNCTIONS
// ===========================

function exportStudents() {
    if (students.length === 0) {
        showAlert('No students to export!', 'warning');
        return;
    }

    const csv = generateCSV();
    downloadCSV(csv, 'students_export.csv');
    showAlert('Students exported successfully!', 'success');
}

function generateCSV() {
    const headers = ['ID', 'Name', 'Email', 'Grade', 'Enrollment Date', 'Status', 'Phone', 'DOB'];
    const rows = students.map(s => [
        s.id,
        `"${s.name}"`,
        `"${s.email}"`,
        s.grade,
        s.date,
        s.status,
        `"${s.phone || ''}"`,
        s.dob || ''
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    return csv;
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
}

function printStudents() {
    const printWindow = window.open('', '', 'height=600,width=800');
    const headers = ['ID', 'Name', 'Email', 'Grade', 'Status'];
    
    let html = `
        <html>
        <head>
            <title>Students Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #1e293b; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background-color: #f0f0f0; font-weight: bold; }
                tr:nth-child(even) { background-color: #f9f9f9; }
            </style>
        </head>
        <body>
            <h1>School Management System - Students Report</h1>
            <p>Generated: ${new Date().toLocaleDateString()}</p>
            <table>
                <thead>
                    <tr>
                        ${headers.map(h => `<th>${h}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${students.map(s => `
                        <tr>
                            <td>${s.id}</td>
                            <td>${escapeHtml(s.name)}</td>
                            <td>${escapeHtml(s.email)}</td>
                            <td>${s.grade}</td>
                            <td>${s.status}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
}

// ===========================
// FORM VALIDATION
// ===========================

function validateStudentForm(name, email, grade) {
    let isValid = true;
    clearFormErrors();

    // Validate name
    if (!name || name.length < 2) {
        showFieldError('studentName', 'Name must be at least 2 characters');
        isValid = false;
    }

    // Validate email
    if (!isValidEmail(email)) {
        showFieldError('studentEmail', 'Please enter a valid email address');
        isValid = false;
    }

    // Validate grade
    if (!grade) {
        showFieldError('studentGrade', 'Please select a grade');
        isValid = false;
    }

    // Check for duplicate email
    const isDuplicate = students.some(s => 
        s.email.toLowerCase() === email.toLowerCase() &&
        (!document.getElementById('editStudentId') || 
         s.id !== parseInt(document.getElementById('editStudentId').value))
    );

    if (isDuplicate) {
        showFieldError('studentEmail', 'Email already exists');
        isValid = false;
    }

    return isValid;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.add('error');
        const errorElement = field.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }
}

function clearFormErrors() {
    document.querySelectorAll('.form-control.error').forEach(field => {
        field.classList.remove('error');
    });
    document.querySelectorAll('.error-message.show').forEach(msg => {
        msg.classList.remove('show');
    });
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

function generateStudentId() {
    const maxId = Math.max(...students.map(s => s.id), 1000);
    return maxId + 1;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showAlert(message, type = 'success') {
    // Create alert if it doesn't exist
    let alert = document.getElementById('alert');
    if (!alert) {
        alert = document.createElement('div');
        alert.id = 'alert';
        alert.className = 'alert';
        document.body.insertBefore(alert, document.body.firstChild);
    }

    alert.className = `alert alert-${type} show`;
    alert.textContent = message;

    // Auto-hide after 3 seconds
    setTimeout(() => {
        alert.classList.remove('show');
    }, 3000);
}

// ===========================
// CLOSE FORMS ON OUTSIDE CLICK
// ===========================

document.addEventListener('click', function(event) {
    const addForm = document.getElementById('addStudentForm');
    const editForm = document.getElementById('editStudentForm');

    if (addForm && event.target === addForm) {
        closeAddStudentForm();
    }

    if (editForm && event.target === editForm) {
        closeEditStudentForm();
    }
});

// ===========================
// KEYBOARD SHORTCUTS
// ===========================

document.addEventListener('keydown', function(event) {
    // ESC key to close modals
    if (event.key === 'Escape') {
        closeAddStudentForm();
        closeEditStudentForm();
    }

    // Ctrl+S or Cmd+S to submit form
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        const activeForm = document.querySelector('.form-overlay[style*="flex"] form');
        if (activeForm) {
            activeForm.dispatchEvent(new Event('submit'));
        }
    }
});
