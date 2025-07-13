let currentStep = 1;
let selectedCourses = [];
let isAdminMode = false;
let pendingRegistrations = [];

function updateProgress() {
    const progress = ((currentStep - 1) / 4) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
}

function showStep(step) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById(`step${step}`).classList.add('active');
    currentStep = step;
    updateProgress();
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username && password) {
        // Simulate credential validation
        showStep(2);
    } else {
        alert('Please enter both username and password');
    }
}

function addSubject() {
    const subject = document.getElementById('subject').value;
    if (subject && !selectedCourses.includes(subject)) {
        selectedCourses.push(subject);
        updateSelectedCourses();
        document.getElementById('subject').value = '';
    }
}

function updateSelectedCourses() {
    const courseList = document.getElementById('courseList');
    const selectedCoursesDiv = document.getElementById('selectedCourses');
    
    if (selectedCourses.length > 0) {
        selectedCoursesDiv.style.display = 'block';
        courseList.innerHTML = selectedCourses.map(course => `
            <div class="course-item">
                <span>${course}</span>
                <button class="remove-btn" onclick="removeCourse('${course}')">Remove</button>
            </div>
        `).join('');
    } else {
        selectedCoursesDiv.style.display = 'none';
    }
}

function removeCourse(course) {
    selectedCourses = selectedCourses.filter(c => c !== course);
    updateSelectedCourses();
}

function nextStep(step) {
    if (step === 3 && selectedCourses.length === 0) {
        alert('Please select at least one subject');
        return;
    }
    if (step === 4 && !document.getElementById('timeSlot').value) {
        alert('Please select a time slot');
        return;
    }
    showStep(step);
}

function submitRegistration() {
    const teacher = document.getElementById('teacher').value;
    const timeSlot = document.getElementById('timeSlot').value;
    if (!teacher) {
        alert('Please select a teacher');
        return;
    }
    // Create registration object
    const registration = {
        id: Date.now(),
        student: document.getElementById('username').value,
        subjects: [...selectedCourses],
        timeSlot: timeSlot,
        teacher: teacher,
        status: 'pending',
        timestamp: new Date().toLocaleString()
    };
    // Add to pending registrations (frontend state)
    pendingRegistrations.push(registration);
    // Send to backend

    console.log('Submitting registration:', registration);
    fetch('http://127.0.0.1:5000/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(registration)
    })
    .then(async res => {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            if (data.success) {
                showStep(5);
            } else {
                alert('Failed to submit registration: ' + (data.error || 'Unknown error'));
            }
        } else {
            const text = await res.text();
            alert('Server error: ' + text);
        }
    })
    .catch(err => {
        alert('Error submitting registration: ' + err);
    });
}

function resetForm() {
    currentStep = 1;
    selectedCourses = [];
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('subject').value = '';
    document.getElementById('timeSlot').value = '';
    document.getElementById('teacher').value = '';
    updateSelectedCourses();
    showStep(1);
}

function toggleMode() {
    isAdminMode = !isAdminMode;
    const adminMode = document.getElementById('adminMode');
    const toggleBtn = document.querySelector('.toggle-btn');
    
    if (isAdminMode) {
        adminMode.style.display = 'block';
        toggleBtn.textContent = '← Back to Student Mode';
        loadPendingRegistrations();
        
        // Add fade-in effect
        setTimeout(() => {
            adminMode.style.opacity = '1';
            adminMode.style.transform = 'translateY(0)';
        }, 10);
    } else {
        adminMode.style.opacity = '0';
        adminMode.style.transform = 'translateY(20px)';
        setTimeout(() => {
            adminMode.style.display = 'none';
        }, 300);
        toggleBtn.textContent = 'Open Admin Panel →';
    }
}

function loadPendingRegistrations() {
    const container = document.getElementById('pendingRegistrations');
    fetch('http://127.0.0.1:5000/registrations')
        .then(res => res.json())
        .then(data => {
            pendingRegistrations = data;
            if (pendingRegistrations.length === 0) {
                container.innerHTML = '<p>No pending registrations</p>';
                return;
            }
            container.innerHTML = pendingRegistrations.map(reg => {
                let statusColor;
                switch (reg.status) {
                    case 'approved':
                        statusColor = 'green';
                        break;
                    case 'rejected':
                        statusColor = 'red';
                        break;
                    case 'pending':
                    default:
                        statusColor = 'orange';
                        break;
                }
                return `
                <div class="registration-item">
                    <div class="registration-info">
                        <p><span class="label">Student:</span> ${reg.student}</p>
                        <p><span class="label">Subjects:</span> ${Array.isArray(reg.subjects) ? reg.subjects.join(', ') : reg.subjects}</p>
                        <p><span class="label">Time Slot:</span> ${reg.time_slot}</p>
                        <p><span class="label">Teacher:</span> ${reg.teacher}</p>
                        <p><span class="label">Submitted:</span> ${reg.timestamp}</p>
                        <p><span class="label">Status:</span> <span style="color:${statusColor}">${reg.status}</span></p>
                    </div>
                    <div class="registration-actions">
                        <button class="approve-btn" onclick="updateRegistrationStatus(${reg.id}, 'approved')" ${reg.status === 'approved' ? 'disabled' : ''}>
                            <span>✓</span> Approve
                        </button>
                        <button class="reject-btn" onclick="updateRegistrationStatus(${reg.id}, 'rejected')" ${reg.status === 'rejected' ? 'disabled' : ''}>
                            <span>✕</span> Reject
                        </button>
                    </div>
                </div>
                `;
            }).join('');
        })
        .catch(() => {
            container.innerHTML = '<p>Error loading registrations</p>';
        });
}

function updateRegistrationStatus(id, status) {
    fetch('http://127.0.0.1:5000/registration/status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, status })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            loadPendingRegistrations();
        } else {
            alert('Failed to update status: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(err => {
        alert('Error updating status: ' + err);
    });
}

// approveRegistration and rejectRegistration are now handled by updateRegistrationStatus

// Initialize
updateProgress();
