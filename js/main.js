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

// category filter: show only the chosen group (and the section that holds it)
const filterButtons = document.querySelectorAll(".filter__buttons button");
const groups = document.querySelectorAll(".group");

function applyFilter(name) {
  filterButtons.forEach((b) => b.setAttribute("aria-pressed", b.dataset.filter === name));
  groups.forEach((g) => { g.hidden = name !== "all" && g.dataset.group !== name; });
  document.querySelectorAll("#work, #web, #personal").forEach((section) => {
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

// work viewer: shows the whole portfolio page of the clicked card
const viewer = document.querySelector(".viewer");
const v = {
  meta: viewer.querySelector(".viewer__meta"),
  title: viewer.querySelector(".viewer__title"),
  jp: viewer.querySelector(".viewer__jp"),
  desc: viewer.querySelector(".viewer__desc"),
  tools: viewer.querySelector(".viewer__tools"),
  link: viewer.querySelector(".viewer__link"),
  images: viewer.querySelector(".viewer__images"),
};

function openViewer(card) {
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

  viewer.showModal();
  viewer.scrollTop = 0;
}

document.querySelectorAll(".card").forEach((card) => {
  card.querySelector(".card__open").addEventListener("click", () => openViewer(card));
});

viewer.querySelector(".viewer__close").addEventListener("click", () => viewer.close());
// close when the dark backdrop is clicked
viewer.addEventListener("click", (e) => {
  if (e.target === viewer) viewer.close();
});
