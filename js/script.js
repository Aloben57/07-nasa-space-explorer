
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');


setupDateInputs(startInput, endInput);
const NASA_API_KEY = 'BWuKN0SnDcWdnHw7hAbEYq5TQ3QhVhtrekaJ1cov';

const gallery = document.getElementById('gallery');
const getButton = document.querySelector('.filters button');

const modal = document.createElement('div');
modal.className = 'apod-modal';
modal.innerHTML = `
	<div class="apod-modal-inner" role="dialog" aria-modal="true">
		<button class="apod-modal-close" aria-label="Close gallery">✕</button>
		<div class="apod-modal-body"></div>
	</div>
`;
document.body.appendChild(modal);

function openModal(item) {
	const body = modal.querySelector('.apod-modal-body');
	body.innerHTML = '';

	const img = document.createElement('img');
	img.src = item.hdurl || item.url;
	img.alt = item.title || 'NASA APOD image';

	const title = document.createElement('h2');
	title.textContent = item.title || '';

	const date = document.createElement('p');
	date.className = 'apod-date';
	date.textContent = item.date || '';

	const explanation = document.createElement('p');
	explanation.className = 'apod-explanation';
	explanation.textContent = item.explanation || '';

	body.appendChild(img);
	body.appendChild(title);
	body.appendChild(date);
	body.appendChild(explanation);

	modal.classList.add('open');
}

function closeModal() {
	modal.classList.remove('open');
}

modal.querySelector('.apod-modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
	if (e.target === modal) closeModal();
});
window.addEventListener('keydown', (e) => {
	if (e.key === 'Escape') closeModal();
});

function formatDate(d) {
	const yyyy = d.getFullYear();
	const mm = String(d.getMonth() + 1).padStart(2, '0');
	const dd = String(d.getDate()).padStart(2, '0');
	return `${yyyy}-${mm}-${dd}`;
}

function getDatesInRange(start, end) {
	const dates = [];
	const cur = new Date(start);
	const last = new Date(end);
	while (cur <= last) {
		dates.push(formatDate(cur));
		cur.setDate(cur.getDate() + 1);
	}
	return dates;
}

function renderGallery(items) {
	gallery.innerHTML = '';
	if (!items || items.length === 0) {
		gallery.innerHTML = `
			<div class="placeholder">
				<div class="placeholder-icon">🔭</div>
				<p>No images found for this range.</p>
			</div>
		`;
		return;
	}

	items.forEach(item => {
		const card = document.createElement('article');
		card.className = 'gallery-item';

		const img = document.createElement('img');
		img.alt = item.title || 'NASA APOD';
		img.loading = 'lazy';
		img.src = item.url || '';

		const caption = document.createElement('p');
		caption.innerHTML = `<strong>${item.title}</strong><br/><span class="apod-date-small">${item.date}</span>`;

		card.appendChild(img);
		card.appendChild(caption);

		img.addEventListener('click', () => openModal(item));

		gallery.appendChild(card);
	});
}

async function fetchApodForDate(date) {
	const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&date=${date}`;
	const res = await fetch(url);
	if (!res.ok) throw new Error(`APOD error: ${res.status}`);
	return res.json();
}

async function loadGallery() {
	const start = startInput.value;
	const end = endInput.value;
	if (!start || !end) return;

	gallery.innerHTML = '<div class="placeholder"><p>Loading…</p></div>';

	const dates = getDatesInRange(start, end);
	try {
		const promises = dates.map(d => fetchApodForDate(d).catch(err => ({ error: true, date: d })));
		const results = await Promise.all(promises);

		const items = results
			.filter(r => r && !r.error)
			.map(r => ({
				title: r.title,
				date: r.date,
				url: r.media_type === 'image' ? (r.url || r.hdurl) : (r.thumbnail_url || r.url),
				hdurl: r.hdurl || r.url,
				explanation: r.explanation,
				media_type: r.media_type,
			}));

		renderGallery(items);
	} catch (err) {
		gallery.innerHTML = `<div class="placeholder"><p>Error loading images: ${err.message}</p></div>`;
		console.error(err);
	}
}

getButton.addEventListener('click', loadGallery);

window.addEventListener('load', () => loadGallery());