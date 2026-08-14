document.addEventListener('DOMContentLoaded', () => {

  // Default demo student data
  const defaultStudentData = {
    regNo: '23BCE10482',
    name: 'ADITYA SHARMA',
    email: 'aditya.23bce10482@gmail.com',
    program: 'BTECH - Computer Science and Engineering',
    school: 'School of Computer Science and Engineering (SCOPE)',
    applicationNo: '2023881024',
    blockName: 'MENS HOSTEL BLOCK-2 (BOYS HOSTEL - Block )',
    roomNo: 'A007',
    bedType: '3- BED -NACPF',
    messInfo: 'NON VEG - M/S MAYURI CATERERS',
    gender: 'MALE',
    dob: '15-AUG-2005',
    bloodGroup: 'O+',
    nationality: 'INDIAN',
    board10: 'CBSE',
    board12: 'CBSE',
    medium: 'ENGLISH',
    fatherName: 'VIKRAM SHARMA',
    motherName: 'ANITA SHARMA',
    proctorName: 'DR. ANIL KUMAR',
    proctorDept: 'SCOPE',
    photoUrl: ''
  };

  let studentData = { ...defaultStudentData };
  try {
    const saved = localStorage.getItem('vtop_student_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.name === 'MILIND VERMA' || parsed.regNo === '23BCE11695') {
        localStorage.removeItem('vtop_student_data');
        studentData = { ...defaultStudentData };
      } else {
        studentData = { ...defaultStudentData, ...parsed };
      }
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
    document.querySelectorAll('[data-bind]').forEach(el => {
      const key = el.getAttribute('data-bind');
      if (key && studentData[key] !== undefined) {
        if (document.activeElement !== el) {
          el.textContent = studentData[key];
        }
      }
    });

    const mainImg = document.getElementById('main-student-img');
    const navImg = document.getElementById('nav-student-img');
    const mainPlaceholder = document.getElementById('photo-placeholder');
    const navPlaceholder = document.getElementById('nav-photo-placeholder');

    if (studentData.photoUrl && studentData.photoUrl.trim() !== '') {
      if (mainImg) {
        mainImg.src = studentData.photoUrl;
        mainImg.style.display = 'block';
      }
      if (navImg) {
        navImg.src = studentData.photoUrl;
        navImg.style.display = 'block';
      }
      if (mainPlaceholder) mainPlaceholder.style.display = 'none';
      if (navPlaceholder) navPlaceholder.style.display = 'none';
    } else {
      if (mainImg) {
        mainImg.src = '';
        mainImg.style.display = 'none';
      }
      if (navImg) {
        navImg.src = '';
        navImg.style.display = 'none';
      }
      if (mainPlaceholder) mainPlaceholder.style.display = 'flex';
      if (navPlaceholder) navPlaceholder.style.display = 'flex';
    }
  }

  // Initial render
  renderAllFields();

  // ==========================================
  // EDIT MODE & SAVE LOCK SYSTEM
  // ==========================================
  let isEditMode = false;

  const toggleEditBtn = document.getElementById('toggle-edit-btn');
  const editBtnIcon = document.getElementById('edit-btn-icon');
  const editBtnLabel = document.getElementById('edit-btn-label');
  const editToast = document.getElementById('edit-toast');
  const toastText = document.getElementById('toast-text');

  function showToast(msg, type = 'active') {
    if (!editToast || !toastText) return;
    toastText.textContent = msg;
    editToast.className = 'edit-mode-toast show ' + (type === 'saved' ? 'saved-lock' : 'active-edit');
    
    clearTimeout(editToast._timer);
    editToast._timer = setTimeout(() => {
      editToast.classList.remove('show');
    }, 3500);
  }

  function setEditModeState(active) {
    isEditMode = active;

    if (isEditMode) {
      document.body.classList.add('is-edit-mode');
      document.querySelectorAll('.editable-field').forEach(el => {
        el.setAttribute('contenteditable', 'true');
      });

      if (toggleEditBtn) toggleEditBtn.classList.add('editing-active');
      if (editBtnIcon) editBtnIcon.style.display = 'none';
      if (editBtnLabel) editBtnLabel.style.display = 'inline';
      if (toggleEditBtn) toggleEditBtn.title = 'Click to Save Changes & Lock Profile';

      showToast('✏️ Edit Mode Active! Click [SAVE] when finished.', 'active');
    } else {
      // Collect latest data before locking
      document.querySelectorAll('[data-bind]').forEach(el => {
        const key = el.getAttribute('data-bind');
        if (key) {
          studentData[key] = el.textContent.trim();
        }
      });
      saveData();
      renderAllFields();

      document.body.classList.remove('is-edit-mode');
      document.querySelectorAll('.editable-field').forEach(el => {
        el.setAttribute('contenteditable', 'false');
        el.blur();
      });

      if (toggleEditBtn) toggleEditBtn.classList.remove('editing-active');
      if (editBtnIcon) editBtnIcon.style.display = 'inline-block';
      if (editBtnLabel) editBtnLabel.style.display = 'none';
      if (toggleEditBtn) toggleEditBtn.title = 'Click to Enable Edit Mode';

      showToast('✓ All changes saved successfully! Profile locked.', 'saved');
    }
  }

  // Ensure default state is LOCKED on load
  setEditModeState(false);

  // Toggle button click listener
  if (toggleEditBtn) {
    toggleEditBtn.addEventListener('click', () => {
      setEditModeState(!isEditMode);
    });
  }

  // 1. Reactive Sync Engine: Listen for live changes on any data-bind element while in Edit Mode
  document.addEventListener('input', (e) => {
    if (!isEditMode) return;
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

  // 2. Photo Upload & CHOOSE PHOTO Handler
  const photoTrigger = document.getElementById('photo-trigger');
  const navPhotoTrigger = document.getElementById('nav-photo-trigger');
  const photoUpload = document.getElementById('photo-upload');

  function openFilePicker() {
    if (photoUpload) {
      photoUpload.click();
    }
  }

  if (photoTrigger) {
    photoTrigger.addEventListener('click', openFilePicker);
  }

  if (navPhotoTrigger) {
    navPhotoTrigger.addEventListener('click', openFilePicker);
  }

  if (photoUpload) {
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
