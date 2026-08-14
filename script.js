document.addEventListener('DOMContentLoaded', () => {

  // Default initial data matching screenshots
  const defaultStudentData = {
    regNo: '23BCE11695',
    name: 'MILIND VERMA',
    email: 'milind.23bce11695@vitbhopal.ac.in',
    program: 'BTECH - Computer Science and Engineering',
    school: 'School of Computer Science and Engineering (SCOPE)',
    applicationNo: '2023998035',
    blockName: 'MENS HOSTEL BLOCK-2 (BOYS HOSTEL - Block )',
    roomNo: 'A007',
    bedType: '3- BED -NACPF',
    messInfo: 'JAIN - M/S JMB CATERERS',
    gender: 'MALE',
    dob: '15-AUG-2005',
    bloodGroup: 'O+',
    nationality: 'INDIAN',
    board10: 'CBSE',
    board12: 'CBSE',
    medium: 'ENGLISH',
    fatherName: 'RAJESH VERMA',
    motherName: 'SUNITA VERMA',
    proctorName: 'DR. ANIL KUMAR',
    proctorDept: 'SCOPE',
    photoUrl: 'student-photo.jpg'
  };

  // Load saved data or fallback to defaults
  let studentData = { ...defaultStudentData };
  try {
    const saved = localStorage.getItem('vtop_student_data');
    if (saved) {
      studentData = { ...defaultStudentData, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Could not parse saved portal state', e);
  }

  // Save current data state to localStorage
  function saveData() {
    try {
      localStorage.setItem('vtop_student_data', JSON.stringify(studentData));
    } catch (e) {
      console.error('Could not save portal state', e);
    }
  }

  // Render state to DOM elements
  function renderAllFields() {
    // Render text fields bound via data-bind
    document.querySelectorAll('[data-bind]').forEach(el => {
      const key = el.getAttribute('data-bind');
      if (key && studentData[key] !== undefined) {
        if (document.activeElement !== el) {
          el.textContent = studentData[key];
        }
      }
    });

    // Render photos
    const mainImg = document.getElementById('main-student-img');
    const navImg = document.getElementById('nav-student-img');
    if (mainImg) mainImg.src = studentData.photoUrl || 'student-photo.jpg';
    if (navImg) navImg.src = studentData.photoUrl || 'student-photo.jpg';
  }

  // Initial render
  renderAllFields();

  // 1. Reactive Sync Engine: Listen for live changes on any data-bind element across any profile section
  document.addEventListener('input', (e) => {
    const target = e.target;
    if (target && target.hasAttribute('data-bind')) {
      const key = target.getAttribute('data-bind');
      const val = target.textContent.trim();
      
      studentData[key] = val;
      saveData();

      // Broadcast update to ALL matching elements across navbar, header, and all accordion sections
      document.querySelectorAll(`[data-bind="${key}"]`).forEach(el => {
        if (el !== target) {
          el.textContent = val;
        }
      });
    }
  });

  // Handle Enter key on editable fields to blur gracefully
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.classList.contains('editable-field')) {
      e.preventDefault();
      e.target.blur();
    }
  });

  // 2. Photo Upload & Synchronization
  const photoTrigger = document.getElementById('photo-trigger');
  const photoUpload = document.getElementById('photo-upload');

  if (photoTrigger && photoUpload) {
    photoTrigger.addEventListener('click', () => {
      photoUpload.click();
    });

    photoUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target.result;
          studentData.photoUrl = dataUrl;
          saveData();
          renderAllFields();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // 3. Session Timer Functionality (counts down from 19m 49s)
  let totalSeconds = (19 * 60) + 49;
  const timerDisplay = document.getElementById('timer-display');

  function updateTimer() {
    if (totalSeconds <= 0) {
      if (timerDisplay) {
        timerDisplay.textContent = '00m 00s';
      }
      return;
    }

    totalSeconds--;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;

    if (timerDisplay) {
      timerDisplay.textContent = `${minutes}m ${formattedSeconds}s`;
    }
  }

  setInterval(updateTimer, 1000);

  // 4. Accordion Functionality
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = item.querySelector('.accordion-content');
      const arrowPolyline = item.querySelector('.arrow-icon polyline');

      const isCurrentlyActive = item.classList.contains('active');

      if (isCurrentlyActive) {
        item.classList.remove('active');
        if (content) {
          content.style.display = 'none';
        }
        if (arrowPolyline) {
          arrowPolyline.setAttribute('points', '6 9 12 15 18 9');
        }
      } else {
        item.classList.add('active');
        if (content) {
          content.style.display = 'block';
        }
        if (arrowPolyline) {
          arrowPolyline.setAttribute('points', '18 15 12 9 6 15');
        }
      }
    });
  });

});
