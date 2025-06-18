
document.addEventListener('DOMContentLoaded', function() {
  // Initialize Lucide icons
  lucide.createIcons();

  // Sidebar functionality
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const menuToggle = document.getElementById('menu-toggle');
  
  menuToggle.addEventListener('click', () => {
    sidebar.classList.remove('sidebar-hidden');
    sidebar.classList.add('sidebar-visible');
    overlay.classList.remove('hidden');
  });

  overlay.addEventListener('click', () => {
    sidebar.classList.add('sidebar-hidden');
    sidebar.classList.remove('sidebar-visible');
    overlay.classList.add('hidden');
  });

  // Navigation switching
  const sections = document.querySelectorAll('.content-section');
  const pageTitle = document.getElementById('page-title');
  const links = document.querySelectorAll('.sidebar-link');

  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = link.dataset.target;
      const linkText = link.querySelector('span').textContent;

      sections.forEach(section => section.classList.add('hidden'));
      document.getElementById(target).classList.remove('hidden');
      pageTitle.textContent = linkText;

      // Close sidebar on mobile
      sidebar.classList.add('sidebar-hidden');
      sidebar.classList.remove('sidebar-visible');
      overlay.classList.add('hidden');
    });
  });

  // Dark mode toggle
  const modeToggle = document.getElementById('mode-toggle');
  
  modeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
  });

  // Check for saved dark mode preference
  if (localStorage.getItem('darkMode') === 'true' || 
      (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }

  // Message modal functionality
  const messageItems = document.querySelectorAll('.message-item');
  const messageModal = document.getElementById('message-modal');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose = document.getElementById('modal-close');
  const modalSender = document.getElementById('modal-sender');
  const modalEmail = document.getElementById('modal-email');
  const modalTime = document.getElementById('modal-time');
  const modalSubject = document.getElementById('modal-subject');
  const modalMessage = document.getElementById('modal-message');
  const replyForm = document.getElementById('reply-form');
  const cancelReply = document.getElementById('cancel-reply');

  // Open modal when clicking a message
  messageItems.forEach(item => {
    item.addEventListener('click', function() {
      modalSender.textContent = this.dataset.sender;
      modalEmail.textContent = this.dataset.email;
      modalTime.textContent = this.dataset.time;
      modalSubject.textContent = this.dataset.subject;
      modalMessage.textContent = this.dataset.message;
      
      messageModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });
  });

  // Close modal function
  function closeMessageModal() {
    messageModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // Close modal handlers
  modalOverlay.addEventListener('click', closeMessageModal);
  modalClose.addEventListener('click', closeMessageModal);
  cancelReply.addEventListener('click', closeMessageModal);

  // Close modal with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !messageModal.classList.contains('hidden')) {
      closeMessageModal();
    }
  });

  // Handle reply form submission
  replyForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const replyMessage = document.getElementById('reply-message').value;
    
    // Here you would typically send the reply to your backend
    console.log('Replying to:', modalEmail.textContent);
    console.log('Message:', replyMessage);
    
    // Show success message (replace with actual backend integration)
    alert('Your response has been sent successfully!');
    closeMessageModal();
    this.reset();
  });
});