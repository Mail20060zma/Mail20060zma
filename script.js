const projectCards = Array.from(document.querySelectorAll(".project-card"));
const projectButtons = Array.from(document.querySelectorAll(".project-toggle"));

let activeCard = null;

function setPanelInteractivity(panel, enabled) {
  if ("inert" in panel) {
    panel.inert = !enabled;
    return;
  }

  const selectors = "a, button, input, textarea, select, [tabindex]";
  const focusables = panel.querySelectorAll(selectors);

  focusables.forEach((element) => {
    if (enabled) {
      if (element.dataset.prevTabindex !== undefined) {
        if (element.dataset.prevTabindex === "") {
          element.removeAttribute("tabindex");
        } else {
          element.setAttribute("tabindex", element.dataset.prevTabindex);
        }
        delete element.dataset.prevTabindex;
      }
      return;
    }

    if (element.dataset.prevTabindex === undefined) {
      element.dataset.prevTabindex = element.getAttribute("tabindex") ?? "";
    }
    element.setAttribute("tabindex", "-1");
  });
}

function setCardState(card, expanded) {
  const button = card.querySelector(".project-toggle");
  const panel = card.querySelector(".project-panel");

  if (!button || !panel) {
    return;
  }

  card.classList.toggle("is-open", expanded);
  button.setAttribute("aria-expanded", String(expanded));
  panel.setAttribute("aria-hidden", String(!expanded));
  setPanelInteractivity(panel, expanded);
}

function closeAllCards() {
  projectCards.forEach((card) => setCardState(card, false));
  activeCard = null;
}

function handleCardToggle(button) {
  const card = button.closest(".project-card");
  if (!card) {
    return;
  }

  const shouldOpen = !card.classList.contains("is-open");

  closeAllCards();

  if (!shouldOpen) {
    return;
  }

  setCardState(card, true);
  activeCard = card;

  if (window.matchMedia("(max-width: 900px)").matches) {
    card.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

projectButtons.forEach((button) => {
  button.addEventListener("click", () => {
    handleCardToggle(button);
  });

  button.addEventListener("keydown", (event) => {
    const currentIndex = projectButtons.indexOf(button);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextButton = projectButtons[(currentIndex + 1) % projectButtons.length];
      nextButton.focus();
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const prevButton =
        projectButtons[(currentIndex - 1 + projectButtons.length) % projectButtons.length];
      prevButton.focus();
    }

    if (event.key === "Escape" && activeCard) {
      closeAllCards();
      button.focus();
    }
  });
});

closeAllCards();

const revealTargets = Array.from(document.querySelectorAll(".reveal"));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealTargets.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  revealTargets.forEach((element) => revealObserver.observe(element));
}

const projectImages = Array.from(document.querySelectorAll(".project-shot-image"));

if (projectImages.length > 0) {
  const lightboxOverlay = document.createElement("div");
  lightboxOverlay.className = "lightbox-overlay";
  lightboxOverlay.setAttribute("role", "dialog");
  lightboxOverlay.setAttribute("aria-modal", "true");
  lightboxOverlay.setAttribute("aria-label", "Полноразмерный просмотр изображения");

  const lightboxContent = document.createElement("figure");
  lightboxContent.className = "lightbox-content";

  const lightboxCloseButton = document.createElement("button");
  lightboxCloseButton.className = "lightbox-close";
  lightboxCloseButton.type = "button";
  lightboxCloseButton.setAttribute("aria-label", "Закрыть просмотр изображения");
  lightboxCloseButton.textContent = "Закрыть";

  const lightboxImage = document.createElement("img");
  lightboxImage.className = "lightbox-image";
  lightboxImage.alt = "";

  const lightboxCaption = document.createElement("figcaption");
  lightboxCaption.className = "lightbox-caption";

  lightboxContent.append(lightboxCloseButton, lightboxImage, lightboxCaption);
  lightboxOverlay.append(lightboxContent);
  document.body.append(lightboxOverlay);

  let lastFocusedElement = null;

  function openLightbox(sourceImage) {
    lastFocusedElement = document.activeElement;
    lightboxImage.src = sourceImage.currentSrc || sourceImage.src;
    lightboxImage.alt = sourceImage.alt || "Скриншот проекта";
    lightboxCaption.textContent = sourceImage.alt || "";

    lightboxOverlay.classList.add("is-open");
    document.body.classList.add("is-lightbox-open");
    lightboxCloseButton.focus();
  }

  function closeLightbox() {
    lightboxOverlay.classList.remove("is-open");
    document.body.classList.remove("is-lightbox-open");

    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  }

  projectImages.forEach((image) => {
    image.setAttribute("role", "button");
    image.setAttribute("tabindex", "0");
    image.setAttribute("aria-label", `${image.alt}. Открыть в полном размере`);

    image.addEventListener("click", () => {
      openLightbox(image);
    });

    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(image);
      }
    });
  });

  lightboxCloseButton.addEventListener("click", closeLightbox);

  lightboxOverlay.addEventListener("click", (event) => {
    if (event.target === lightboxOverlay) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightboxOverlay.classList.contains("is-open")) {
      closeLightbox();
    }
  });
}
