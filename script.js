(() => {
  const slider = document.querySelector("[data-slider]");
  const sectionsToReveal = document.querySelectorAll(".reveal");
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");

  const setupReveal = () => {
    if (!("IntersectionObserver" in window)) {
      sectionsToReveal.forEach((section) => section.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );

    sectionsToReveal.forEach((section) => observer.observe(section));
  };

  const setupSlider = () => {
    if (!slider) return;

    const slides = Array.from(slider.querySelectorAll(".slide"));
    const dotsContainer = slider.querySelector("[data-dots]");
    const prevButton = slider.querySelector("[data-prev]");
    const nextButton = slider.querySelector("[data-next]");
    let currentIndex = 0;
    let autoRotateId = null;

    const dots = slides.map((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "slider-dot";
      dot.setAttribute("aria-label", `Перейти к слайду ${index + 1}`);
      dot.addEventListener("click", () => goTo(index));
      dotsContainer.appendChild(dot);
      return dot;
    });

    const setActive = (index) => {
      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === index;
        slide.classList.toggle("is-active", isActive);
      });
      dots.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === index));
      currentIndex = index;
    };

    const goTo = (index) => {
      const safeIndex = (index + slides.length) % slides.length;
      setActive(safeIndex);
    };

    const next = () => goTo(currentIndex + 1);
    const prev = () => goTo(currentIndex - 1);

    const stopAutoRotate = () => {
      if (!autoRotateId) return;
      clearInterval(autoRotateId);
      autoRotateId = null;
    };

    const startAutoRotate = () => {
      stopAutoRotate();
      autoRotateId = setInterval(next, 5500);
    };

    prevButton?.addEventListener("click", () => {
      prev();
      startAutoRotate();
    });

    nextButton?.addEventListener("click", () => {
      next();
      startAutoRotate();
    });

    slider.addEventListener("mouseenter", stopAutoRotate);
    slider.addEventListener("mouseleave", startAutoRotate);
    slider.addEventListener("focusin", stopAutoRotate);
    slider.addEventListener("focusout", startAutoRotate);

    window.addEventListener("keydown", (event) => {
      if (!slider.matches(":hover") && !slider.contains(document.activeElement)) return;
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") prev();
    });

    let touchStartX = 0;
    let touchEndX = 0;
    slider.addEventListener("touchstart", (event) => {
      touchStartX = event.changedTouches[0].screenX;
    });
    slider.addEventListener("touchend", (event) => {
      touchEndX = event.changedTouches[0].screenX;
      const delta = touchStartX - touchEndX;
      if (Math.abs(delta) < 35) return;
      delta > 0 ? next() : prev();
      startAutoRotate();
    });

    setActive(currentIndex);
    startAutoRotate();
  };

  const setupForm = () => {
    if (!form || !status) return;

    const isValidPhone = (value) => /\+?\d[\d\s\-()]{9,}/.test(value.trim());

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      status.className = "form-status";

      const formData = new FormData(form);
      const name = String(formData.get("name") || "").trim();
      const phone = String(formData.get("phone") || "").trim();

      if (!name || !phone) {
        status.textContent = "Пожалуйста, заполните имя и телефон.";
        status.classList.add("error");
        return;
      }

      if (!isValidPhone(phone)) {
        status.textContent = "Проверьте формат телефона и попробуйте снова.";
        status.classList.add("error");
        return;
      }

      status.textContent = "Спасибо, заявка принята. Мы свяжемся с вами в ближайшее время.";
      status.classList.add("success");
      form.reset();
    });
  };

  setupReveal();
  setupSlider();
  setupForm();
})();
