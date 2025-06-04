

  // Hero Section Swiper
  new Swiper('.hero-swiper', {
    loop: true,
    speed: 2000,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    },
    effect: 'cube', // try 'fade', 'coverflow', or 'slide' if preferred
    cubeEffect: {
      shadow: false,
      slideShadows: false,
      shadowOffset: 20,
      shadowScale: 0.94,
    }
  });

  // Testimonial Swiper
  new Swiper('.testimonial-swiper', {
    loop: true,
    slidesPerView: 1,
    spaceBetween: 20,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    breakpoints: {
      768: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: 3,
      }
    }
  });


//  Toggle Menu Script 

  const toggleBtn = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  
  toggleBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });

// FAQ Toggle Script 

  function toggleFAQ(faqNumber) {
    const answer = document.getElementById(`faq-answer-${faqNumber}`);
    answer.classList.toggle('hidden');
  }
