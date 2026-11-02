// Draft Paper interactions. Every page works without them; they only add detail.

const root = document.documentElement;
const pad = (n: number) => String(n).padStart(2, "0");

// // Easter egg: the title block's Material cell cycles the paper: bone, white, blueprint.
// // The first paint is handled by an inline script in Base.astro (saved choice, else the
// // system's dark mode). Until a visitor picks, the paper keeps following the system.
// const PAPERS = ['bone', 'white', 'blueprint'];
// const toggles = document.querySelectorAll<HTMLButtonElement>('.paper-toggle');
// const currentPaper = () => root.dataset.paper ?? 'bone';
// const setPaper = (paper: string) => {
//   if (paper === 'bone') delete root.dataset.paper;
//   else root.dataset.paper = paper;
//   toggles.forEach((button) => (button.textContent = paper[0].toUpperCase() + paper.slice(1)));
// };
// const savedPaper = () => {
//   try {
//     return localStorage.getItem('paper');
//   } catch {
//     return null;
//   }
// };
// toggles.forEach((button) =>
//   button.addEventListener('click', () => {
//     const next = PAPERS[(PAPERS.indexOf(currentPaper()) + 1) % PAPERS.length];
//     setPaper(next);
//     try {
//       localStorage.setItem('paper', next);
//     } catch {}
//   }),
// );
// setPaper(currentPaper());
// matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({ matches }) => {
//   if (!savedPaper()) setPaper(matches ? 'blueprint' : 'bone');
// });

// Plates. CSS snaps their width to the grid (site.css); here their height is rounded up
// to whole cells, so the last row is never cut short. Hovering fills the cell under the
// pointer and reads out its sheet coordinate (major column letter and row number, then
// the minor cell).
const cell = parseInt(getComputedStyle(root).getPropertyValue("--cell"), 10);
/** Cells that fit in a border-box length: the grid starts on one hairline and ends on another. */
const cellsIn = (length: number) => Math.floor((length - 1) / cell);

// Resizing inside the observer's callback would trigger it again in the same frame
// (a "ResizeObserver loop" error), so the snap runs in the next frame instead.
const snap = (plate: HTMLElement) => {
	plate.style.minHeight = "";
	const height = plate.getBoundingClientRect().height;
	plate.style.minHeight = `${Math.ceil((height - 1) / cell) * cell + 1}px`;
};
const snapHeight = new ResizeObserver((entries) =>
	requestAnimationFrame(() =>
		entries.forEach(({ target }) => snap(target as HTMLElement)),
	),
);

document.querySelectorAll<HTMLElement>(".plate").forEach((plate) => {
	snapHeight.observe(plate);
	const marker = plate.querySelector<HTMLElement>(".plate-cell")!;
	const readout = plate.querySelector<HTMLElement>(".plate-coords")!;
	const initial = readout.textContent;
	plate.addEventListener("pointermove", (e) => {
		const box = plate.getBoundingClientRect();
		const clamp = (n: number, length: number) =>
			Math.min(Math.max(n, 0), cellsIn(length) - 1);
		const col = clamp(Math.floor((e.clientX - box.left) / cell), box.width);
		const row = clamp(Math.floor((e.clientY - box.top) / cell), box.height);
		marker.style.transform = `translate(${col * cell - 1}px, ${row * cell - 1}px)`;
		readout.textContent = `${String.fromCharCode(65 + (Math.floor(col / 5) % 26))}${Math.floor(row / 5) + 1} · ${pad(col)},${pad(row)}`;
	});
	plate.addEventListener("pointerleave", () => (readout.textContent = initial));
});

// Dimension line: label the sheet's real width in rem, which changes with the viewport
// because the sheet snaps to the grid. The static label is right at full width.
const dimension = document.querySelector<HTMLElement>(".dimension");
const sheet = document.querySelector<HTMLElement>(".sheet");
if (dimension && sheet) {
	const remPx = parseFloat(getComputedStyle(root).fontSize);
	new ResizeObserver(([{ borderBoxSize }]) => {
		dimension.textContent = `${+(borderBoxSize[0].inlineSize / remPx).toFixed(2)} rem`;
	}).observe(sheet);
}

// Links to other sites open in a new tab.
document
	.querySelectorAll<HTMLAnchorElement>('a[href^="http"]')
	.forEach((link) => {
		if (link.host === location.host) return;
		link.target = "_blank";
		link.rel = "noopener noreferrer";
	});

// Wide tables scroll sideways on small screens; make those focusable so keyboard users can scroll them.
document.querySelectorAll<HTMLElement>(".prose table").forEach((table) => {
	if (table.scrollWidth > table.clientWidth) table.tabIndex = 0;
});

// Table of contents: mark the section being read. Without JS the links still work as anchors.
const tocLinks = new Map(
	[...document.querySelectorAll<HTMLAnchorElement>(".toc a")].map((a) => [
		a.hash.slice(1),
		a,
	]),
);
if (tocLinks.size) {
	const visible = new Set<string>();
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((e) =>
				e.isIntersecting
					? visible.add(e.target.id)
					: visible.delete(e.target.id),
			);
			const current = [...tocLinks.keys()].find((id) => visible.has(id));
			if (!current) return;
			tocLinks.forEach((a, id) =>
				id === current
					? a.setAttribute("aria-current", "location")
					: a.removeAttribute("aria-current"),
			);
		},
		{ rootMargin: "0px 0px -70% 0px" },
	);
	tocLinks.forEach((_, id) => observer.observe(document.getElementById(id)!));
}
