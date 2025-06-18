

document.querySelectorAll('[data-open-upload]').forEach(button => {
  button.addEventListener('click', () => {
    document.getElementById('uploadModal').classList.remove('hidden');
  });
});

document.querySelectorAll('[data-close-upload]').forEach(button => {
  button.addEventListener('click', () => {
    document.getElementById('uploadModal').classList.add('hidden');
  });
});

  // Initialize Lucide Icons
  lucide.createIcons();

  // Sidebar Toggle
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');

  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar-hidden');
    sidebar.classList.toggle('sidebar-visible');
    overlay.classList.toggle('hidden');
  });

  overlay.addEventListener('click', () => {
    sidebar.classList.add('sidebar-hidden');
    sidebar.classList.remove('sidebar-visible');
    overlay.classList.add('hidden');
  });

  // Dark Mode Toggle
  const modeToggle = document.getElementById('mode-toggle');
  modeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
  });

  // Load dark mode preference
  if (localStorage.getItem('darkMode') === 'true') {
    document.documentElement.classList.add('dark');
  }

  // Section Navigation
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  const contentSections = document.querySelectorAll('.content-section');
  const pageTitle = document.getElementById('page-title');

  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-target');
      
      contentSections.forEach(section => {
        section.classList.add('hidden');
        if (section.id === target) {
          section.classList.remove('hidden');
        }
      });

      pageTitle.textContent = target.charAt(0).toUpperCase() + target.slice(1);
      
      // Close sidebar on mobile after click
      if (window.innerWidth < 768) {
        sidebar.classList.add('sidebar-hidden');
        sidebar.classList.remove('sidebar-visible');
        overlay.classList.add('hidden');
      }
    });
  });

  // Messages Section Logic
  const itemsPerPage = 2;
  let currentPage = 1;

  const messageItems = document.querySelectorAll('.message-item');
  const totalPages = Math.ceil(messageItems.length / itemsPerPage);

  function updatePagination() {
    messageItems.forEach((item, index) => {
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      item.style.display = index >= start && index < end ? 'block' : 'none';
      if (index >= start && index < end) {
        item.classList.add('animate-slide-in');
        setTimeout(() => item.classList.remove('animate-slide-in'), 300);
      }
    });
  }

  document.getElementById('send-btn').addEventListener('click', () => {
    const text = document.getElementById('new-message').value.trim();
    if (text) {
      const newDiv = document.createElement('div');
      newDiv.className = 'p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer message-item animate-slide-in';
      newDiv.innerHTML = `
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <i data-lucide="user" class="w-5 h-5 text-blue-600 dark:text-blue-400"></i>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">You</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Just now</p>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 truncate">${text}</p>
          </div>
        </div>
      `;
      newDiv.dataset.sender = 'You';
      newDiv.dataset.email = 'user@example.com';
      newDiv.dataset.time = 'Just now';
      newDiv.dataset.subject = text;
      newDiv.dataset.message = text;
      document.getElementById('message-list').appendChild(newDiv);
      document.getElementById('new-message').value = '';

      // Update message items and pagination
      const newItems = document.querySelectorAll('.message-item');
      const newTotalPages = Math.ceil(newItems.length / itemsPerPage);
      currentPage = newTotalPages;
      updatePagination();

      // Auto-scroll to bottom
      const messageList = document.getElementById('message-list');
      messageList.scrollTop = messageList.scrollHeight;

      // Re-attach modal event listeners
      attachModalListeners();
    }
  });

  // Modal Logic
  const messageModal = document.getElementById('message-modal');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose = document.getElementById('modal-close');
  const cancelReply = document.getElementById('cancel-reply');
  const replyForm = document.getElementById('reply-form');

  function openModal(sender, email, time, subject, message) {
    document.getElementById('modal-sender').textContent = sender;
    document.getElementById('modal-email').textContent = email;
    document.getElementById('modal-time').textContent = time;
    document.getElementById('modal-subject').textContent = subject;
    document.getElementById('modal-message').textContent = message;
    messageModal.classList.remove('hidden');
  }

  function closeModal() {
    messageModal.classList.add('hidden');
    document.getElementById('reply-message').value = '';
  }

  function attachModalListeners() {
    document.querySelectorAll('.message-item').forEach(item => {
      item.addEventListener('click', () => {
        const { sender, email, time, subject, message } = item.dataset;
        openModal(sender, email, time, subject, message);
      });
    });
  }

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);
  cancelReply.addEventListener('click', closeModal);

  replyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const replyText = document.getElementById('reply-message').value.trim();
    if (replyText) {
      const newDiv = document.createElement('div');
      newDiv.className = 'p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer message-item animate-slide-in';
      newDiv.innerHTML = `
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <i data-lucide="user" class="w-5 h-5 text-blue-600 dark:text-blue-400"></i>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">You</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Just now</p>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 truncate">${replyText}</p>
          </div>
        </div>
      `;
      newDiv.dataset.sender = 'You';
      newDiv.dataset.email = 'user@example.com';
      newDiv.dataset.time = 'Just now';
      newDiv.dataset.subject = replyText;
      newDiv.dataset.message = replyText;
      document.getElementById('message-list').appendChild(newDiv);

      // Update message items and pagination
      const newItems = document.querySelectorAll('.message-item');
      const newTotalPages = Math.ceil(newItems.length / itemsPerPage);
      currentPage = newTotalPages;
      updatePagination();

      // Auto-scroll to bottom
      const messageList = document.getElementById('message-list');
      messageList.scrollTop = messageList.scrollHeight;

      // Close modal and reset form
      closeModal();

      // Re-attach modal event listeners
      attachModalListeners();
    }
  });

  // Initialize Messages Section
  updatePagination();
  attachModalListeners();