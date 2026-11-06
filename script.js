const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));
document.getElementById('year').textContent = new Date().getFullYear();
const backTop = document.getElementById('backTop');
window.addEventListener('scroll', () => {
  backTop.classList.toggle('visible', window.scrollY > 500);
});
backTop.addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));


// Project image viewer
const imageViewer = document.createElement("dialog");
imageViewer.className = "image-viewer";
imageViewer.setAttribute("aria-label", "Project image viewer");
imageViewer.innerHTML = `
  <div class="image-viewer-content">
    <button class="image-viewer-close" type="button" aria-label="Close image viewer">&times;</button>
    <button class="image-viewer-nav image-viewer-prev" type="button" aria-label="Previous image">&#10094;</button>
    <figure class="image-viewer-figure">
      <img class="image-viewer-image" alt="">
      <video class="image-viewer-video" controls playsinline hidden></video>
      <iframe class="image-viewer-embed" title="Project video showcase" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" hidden></iframe>
      <figcaption class="image-viewer-caption"></figcaption>
      <button class="image-viewer-mode" type="button" hidden></button>
    </figure>
    <button class="image-viewer-nav image-viewer-next" type="button" aria-label="Next image">&#10095;</button>
    <div class="image-viewer-dots" aria-label="Choose image"></div>
  </div>
`;
document.body.appendChild(imageViewer);

const viewerImage = imageViewer.querySelector(".image-viewer-image");
const viewerVideo = imageViewer.querySelector(".image-viewer-video");
const viewerEmbed = imageViewer.querySelector(".image-viewer-embed");
const viewerCaption = imageViewer.querySelector(".image-viewer-caption");
const viewerModeButton = imageViewer.querySelector(".image-viewer-mode");
const viewerDots = imageViewer.querySelector(".image-viewer-dots");
let viewerImages = [];
let viewerIndex = 0;
let viewerShowcase = null;
let viewerProjectName = "";
let viewerMode = "images";

function showViewerImage(index) {
    viewerMode = "images";
    viewerVideo.pause();
    viewerVideo.removeAttribute("src");
    viewerEmbed.removeAttribute("src");
    viewerVideo.hidden = true;
    viewerEmbed.hidden = true;
    viewerImage.hidden = false;
    viewerModeButton.hidden = !viewerShowcase;
    viewerIndex = (index + viewerImages.length) % viewerImages.length;
    const image = viewerImages[viewerIndex];

    viewerImage.src = image.src;
    viewerImage.alt = image.alt;
    viewerCaption.textContent = `${viewerProjectName} · Screenshot ${viewerIndex + 1} of ${viewerImages.length}`;
    viewerModeButton.textContent = "Back to video showcase";
    viewerDots.querySelectorAll("button").forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === viewerIndex);
        dot.setAttribute("aria-current", String(dotIndex === viewerIndex));
    });
}

function showViewerShowcase() {
    viewerMode = "showcase";
    viewerImage.removeAttribute("src");
    viewerImage.hidden = true;
    viewerVideo.pause();
    viewerVideo.removeAttribute("src");
    viewerEmbed.removeAttribute("src");
    viewerVideo.hidden = true;
    viewerEmbed.hidden = true;

    if (viewerShowcase.type === "file") {
        viewerVideo.src = viewerShowcase.src;
        viewerVideo.hidden = false;
    } else {
        viewerEmbed.src = viewerShowcase.src;
        viewerEmbed.hidden = false;
    }

    viewerCaption.textContent = `${viewerProjectName} · ${viewerShowcase.type === "page" ? "Interactive showcase" : "Video showcase"}`;
    viewerModeButton.hidden = viewerImages.length === 0;
    viewerModeButton.textContent = "Browse screenshots";
    imageViewer.querySelector(".image-viewer-prev").hidden = true;
    imageViewer.querySelector(".image-viewer-next").hidden = true;
    viewerDots.hidden = true;
}

function getShowcaseSource(value) {
    if (!value) return null;

    let url;
    try {
        url = new URL(value, window.location.href);
    } catch {
        console.error("Invalid project showcase URL:", value);
        return null;
    }

    if (!["http:", "https:"].includes(url.protocol)) {
        console.warn("Project showcase URL must use HTTP or HTTPS:", value);
        return null;
    }

    const host = url.hostname.toLowerCase();
    if (host === "youtu.be" || host === "youtube.com" || host === "www.youtube.com" || host === "m.youtube.com") {
        const videoId = host === "youtu.be"
            ? url.pathname.split("/").filter(Boolean)[0]
            : url.searchParams.get("v") || url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1];
        if (!videoId || !/^[\w-]{11}$/.test(videoId)) return null;
        return { type: "embed", src: `https://www.youtube-nocookie.com/embed/${videoId}` };
    }

    if (host === "vimeo.com" || host === "www.vimeo.com" || host === "player.vimeo.com") {
        const videoId = url.pathname.match(/\/(?:video\/)?(\d+)(?:\/|$)/)?.[1];
        if (!videoId) return null;
        return { type: "embed", src: `https://player.vimeo.com/video/${videoId}` };
    }

    if (url.origin === window.location.origin && /\.html?$/i.test(url.pathname)) {
        return { type: "page", src: url.href };
    }

    if (/\.(mp4|webm|ogg)$/i.test(url.pathname)) {
        return { type: "file", src: url.href };
    }

    console.warn("Unsupported project showcase URL. Use a same-site HTML page, YouTube, Vimeo or a video file:", value);
    return null;
}

function openImageViewer(carousel, selectedIndex) {
    viewerProjectName = carousel.closest(".project-card")
        ?.querySelector("h3")?.textContent.trim() || "Project";

    viewerImages = [...carousel.querySelectorAll(".carousel-slide img")].map(image => ({
        src: image.currentSrc || image.src,
        alt: image.alt
    }));
    viewerShowcase = getShowcaseSource(carousel.dataset.showcase);

    if (!viewerImages.length && !viewerShowcase) return;

    viewerDots.replaceChildren(...viewerImages.map((_, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "image-viewer-dot";
        dot.setAttribute("aria-label", `Go to image ${index + 1}`);
        dot.addEventListener("click", () => showViewerImage(index));
        return dot;
    }));

    const canNavigateImages = viewerImages.length > 1;
    imageViewer.querySelector(".image-viewer-prev").hidden = !canNavigateImages;
    imageViewer.querySelector(".image-viewer-next").hidden = !canNavigateImages;
    viewerDots.hidden = !canNavigateImages;

    if (viewerShowcase) {
        showViewerShowcase();
    } else if (viewerImages.length) {
        showViewerImage(selectedIndex);
    }
    imageViewer.showModal();
}

imageViewer.addEventListener("click", event => {
    const target = event.target;

    if (!(target instanceof Element)) return;

    if (target === imageViewer || target.closest(".image-viewer-close")) {
        imageViewer.close();
    } else if (target.closest(".image-viewer-prev")) {
        showViewerImage(viewerIndex - 1);
    } else if (target.closest(".image-viewer-next")) {
        showViewerImage(viewerIndex + 1);
    } else if (target.closest(".image-viewer-mode")) {
        if (viewerMode === "showcase" && viewerImages.length) {
            showViewerImage(viewerIndex);
            imageViewer.querySelector(".image-viewer-prev").hidden = viewerImages.length < 2;
            imageViewer.querySelector(".image-viewer-next").hidden = viewerImages.length < 2;
            viewerDots.hidden = viewerImages.length < 2;
        } else if (viewerMode === "images" && viewerShowcase) {
            showViewerShowcase();
        }
    }
});

imageViewer.addEventListener("close", () => {
    viewerVideo.pause();
    viewerVideo.removeAttribute("src");
    viewerEmbed.removeAttribute("src");
});

imageViewer.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        event.preventDefault();
        imageViewer.close();
    } else if (event.key === "ArrowLeft" && viewerMode === "images" && viewerImages.length > 1) {
        event.preventDefault();
        showViewerImage(viewerIndex - 1);
    } else if (event.key === "ArrowRight" && viewerMode === "images" && viewerImages.length > 1) {
        event.preventDefault();
        showViewerImage(viewerIndex + 1);
    }
});

viewerImage.addEventListener("error", () => {
    viewerImage.hidden = true;
    viewerCaption.textContent = "This project screenshot could not be loaded.";
});

document.addEventListener("click", event => {
    const target = event.target;

    if (!(target instanceof Element)) return;

    const carousel = target.closest(".project-carousel");
    if (!carousel) return;

    const slides = [...carousel.querySelectorAll(".carousel-slide")];
    if (!slides.length) return;

    let activeIndex = slides.findIndex(slide => slide.classList.contains("active"));
    if (activeIndex < 0) activeIndex = 0;

    const carouselButton = target.closest(".carousel-btn");
    const dotButton = target.closest(".carousel-dot");

    if (target.closest(".showcase-badge")) {
        openImageViewer(carousel, activeIndex);
    } else if (carouselButton) {
        const direction = Number(carouselButton.dataset.direction);
        activeIndex = (activeIndex + direction + slides.length) % slides.length;
    } else if (dotButton) {
        activeIndex = Number(dotButton.dataset.slide);
    } else if (target.closest(".carousel-slide img") ||
               (carousel.dataset.showcase && target.closest(".carousel-slide"))) {
        openImageViewer(carousel, activeIndex);
        return;
    } else {
        return;
    }

    slides.forEach((slide, index) => {
        slide.classList.toggle("active", index === activeIndex);
    });
    carousel.querySelectorAll(".carousel-dot").forEach((dot, index) => {
        dot.classList.toggle("active", index === activeIndex);
    });
});

document.addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const preview = target.closest(".carousel-showcase-preview[role='button']");
    if (!(target instanceof HTMLImageElement && target.matches(".carousel-slide img")) && !preview) return;

    event.preventDefault();
    const carousel = target.closest(".project-carousel");
    const slides = [...carousel.querySelectorAll(".carousel-slide")];
    const activeIndex = slides.findIndex(slide => slide.classList.contains("active"));
    openImageViewer(carousel, Math.max(activeIndex, 0));
});

document.addEventListener("error", event => {
    const image = event.target;

    if (image instanceof HTMLImageElement && image.matches(".carousel-slide img")) {
        image.closest(".carousel-slide").classList.add("image-error");
        image.remove();
    }
}, true);
