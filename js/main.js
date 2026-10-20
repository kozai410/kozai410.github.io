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
  }
});

// work viewer: shows the large portfolio images of the clicked card
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

  const pages = card.dataset.pages.split(",");
  const captions = (card.dataset.captions || "").split("|");
  v.images.textContent = "";
  pages.forEach((p, i) => {
    const src = `images/works/page-${p.trim()}.jpg`;
    const fig = document.createElement("figure");
    const a = document.createElement("a");
    a.href = src;
    a.target = "_blank";
    a.rel = "noopener";
    const img = document.createElement("img");
    img.src = src;
    img.width = 2023;
    img.height = 1287;
    img.alt = `${v.title.textContent} ${captions[i] || ""}`.trim();
    a.append(img);
    fig.append(a);
    if (captions[i]) {
      const cap = document.createElement("figcaption");
      cap.textContent = captions[i];
      fig.append(cap);
    }
    v.images.append(fig);
  });

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
