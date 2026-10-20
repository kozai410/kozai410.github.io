// mobile menu
const toggle = document.querySelector(".site-header__toggle");
const nav = document.querySelector(".site-header__nav");

toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", open);
});
nav.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    applyFilter("all"); // a menu jump should never land on a hidden category
  }
});

// ---------- portfolio slider (every page of the printed portfolio) ----------
const track = document.querySelector(".slider__track");
const slides = [...track.querySelectorAll(".slider__slide")];
const prevSlide = document.querySelector(".slider__prev");
const nextSlide = document.querySelector(".slider__next");
const count = document.querySelector(".slider__count");
const label = document.querySelector(".slider__label");
const pad = (n) => String(n).padStart(2, "0");

let slideIndex = 0; // the page shown; the CSS shifts the slides by this many widths

// page-number buttons (01 … 19) to jump straight to a page
const pageButtons = slides.map((slide, i) => {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = pad(i + 1);
  b.title = slide.dataset.label;
  b.setAttribute("aria-label", `${i + 1}ページ目：${slide.dataset.label}`);
  b.addEventListener("click", () => goToSlide(i));
  document.querySelector(".slider__pages").append(b);
  return b;
});

function showSlideStatus(i) {
  count.textContent = `${pad(i + 1)} / ${pad(slides.length)}`;
  label.textContent = slides[i].dataset.label;
  prevSlide.disabled = i === 0;
  nextSlide.disabled = i === slides.length - 1;
  pageButtons.forEach((b, k) => b.setAttribute("aria-current", k === i));
}
function goToSlide(i) {
  slideIndex = Math.max(0, Math.min(slides.length - 1, i));
  track.style.setProperty("--i", slideIndex);
  showSlideStatus(slideIndex);
  // start loading this page and its neighbours right away (the rest stay lazy)
  [slideIndex - 1, slideIndex, slideIndex + 1].forEach((k) => {
    if (slides[k]) slides[k].querySelector("img").loading = "eager";
  });
}
prevSlide.addEventListener("click", () => goToSlide(slideIndex - 1));
nextSlide.addEventListener("click", () => goToSlide(slideIndex + 1));
track.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") { e.preventDefault(); goToSlide(slideIndex - 1); }
  if (e.key === "ArrowRight") { e.preventDefault(); goToSlide(slideIndex + 1); }
});

// swipe (touch or mouse drag): decide on release, and don't open the image link after a drag
let startX = null, startY = 0, dragged = false;
track.addEventListener("pointerdown", (e) => { startX = e.clientX; startY = e.clientY; dragged = false; });
track.addEventListener("pointerup", (e) => {
  if (startX === null) return;
  const dx = e.clientX - startX, dy = e.clientY - startY;
  startX = null;
  if (Math.abs(dx) > 8) dragged = true;
  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) goToSlide(slideIndex + (dx < 0 ? 1 : -1));
});
track.addEventListener("pointercancel", () => { startX = null; });
track.addEventListener("click", (e) => {
  if (dragged) { e.preventDefault(); dragged = false; }
}, true);
track.addEventListener("dragstart", (e) => e.preventDefault());

goToSlide(0);

// ---------- category filter: show only the chosen group (and the section that holds it) ----------
const filterButtons = document.querySelectorAll(".filter__buttons button");
const groups = document.querySelectorAll(".group");

function applyFilter(name) {
  filterButtons.forEach((b) => b.setAttribute("aria-pressed", b.dataset.filter === name));
  groups.forEach((g) => { g.hidden = name !== "all" && g.dataset.group !== name; });
  document.querySelectorAll("#sign, #web, #personal").forEach((section) => {
    section.hidden = ![...section.querySelectorAll(".group")].some((g) => !g.hidden);
  });
}

filterButtons.forEach((b) => {
  b.addEventListener("click", () => {
    applyFilter(b.dataset.filter);
    // bring the filter bar right under the header (the bar itself is sticky, so measure a static marker)
    const top = document.getElementById("works-top").offsetTop - document.querySelector(".site-header").offsetHeight;
    window.scrollTo({ top, behavior: "smooth" });
  });
});

// ---------- work viewer: the whole page of the chosen work, with previous / next ----------
const viewer = document.querySelector(".viewer");
const v = {
  meta: viewer.querySelector(".viewer__meta"),
  title: viewer.querySelector(".viewer__title"),
  jp: viewer.querySelector(".viewer__jp"),
  desc: viewer.querySelector(".viewer__desc"),
  tools: viewer.querySelector(".viewer__tools"),
  link: viewer.querySelector(".viewer__link"),
  images: viewer.querySelector(".viewer__images"),
  prev: viewer.querySelector(".viewer__prev"),
  next: viewer.querySelector(".viewer__next"),
  pos: viewer.querySelector(".viewer__pos"),
};
const cards = [...document.querySelectorAll(".card")];
let shown = []; // the cards that can be stepped through (respects the category filter)
let at = 0;

function showCard(card) {
  v.meta.textContent = card.querySelector(".card__meta").textContent;
  v.title.textContent = card.querySelector(".card__title").textContent;
  v.jp.textContent = card.querySelector(".card__jp").textContent;
  v.desc.textContent = card.querySelector(".card__desc").textContent;
  v.tools.innerHTML = card.querySelector(".tools").innerHTML;

  v.link.textContent = "";
  if (card.dataset.link) {
    const a = document.createElement("a");
    a.href = card.dataset.link;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = card.dataset.link.replace(/^https?:\/\//, "").replace(/\/$/, "") + " ↗";
    v.link.append(a);
  }

  const src = `images/works/page-${card.dataset.page}.jpg`;
  const fig = document.createElement("figure");
  const a = document.createElement("a");
  a.href = src;
  a.target = "_blank";
  a.rel = "noopener";
  const img = document.createElement("img");
  img.src = src;
  img.width = 2001;
  img.height = 1415;
  img.alt = card.querySelector(".card__img").alt;
  a.append(img);
  fig.append(a);
  v.images.textContent = "";
  v.images.append(fig);

  v.pos.textContent = `${pad(at + 1)} / ${pad(shown.length)}`;
  v.prev.disabled = at === 0;
  v.next.disabled = at === shown.length - 1;
  viewer.scrollTop = 0;
}

function openViewer(card) {
  shown = cards.filter((c) => !c.closest("[hidden]"));
  at = shown.indexOf(card);
  showCard(card);
  viewer.showModal();
}
function step(d) {
  const n = at + d;
  if (n < 0 || n >= shown.length) return;
  at = n;
  showCard(shown[at]);
}

cards.forEach((card) => card.querySelector(".card__open").addEventListener("click", () => openViewer(card)));
v.prev.addEventListener("click", () => step(-1));
v.next.addEventListener("click", () => step(1));
viewer.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "ArrowRight") step(1);
});
viewer.querySelector(".viewer__close").addEventListener("click", () => viewer.close());
// close when the dark backdrop is clicked
viewer.addEventListener("click", (e) => {
  if (e.target === viewer) viewer.close();
});
// keep the list scrolled to the work that was open last
viewer.addEventListener("close", () => shown[at] && shown[at].scrollIntoView({ block: "center" }));
