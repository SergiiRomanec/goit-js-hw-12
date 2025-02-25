import { fetchImages } from './js/pixabay-api.js';
import { renderGallery } from './js/render-functions.js';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.search-form');
  const inputField = document.querySelector("input[name='searchQuery']");
  const loader = document.querySelector('.loader');
  const gallery = document.querySelector('.gallery');
  const loadMoreBtn = document.querySelector('.load-btn');

  let currentQuery = '';
  let currentPage = 1;
  let totalHits = 0;

  loadMoreBtn.style.display = 'none';

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const query = inputField.value.trim();

    if (!query) {
      showError('Please enter a search term!');
      return;
    }

    resetGallery();
    currentQuery = query;
    currentPage = 1;

    await loadImages();
  });

  loadMoreBtn.addEventListener('click', async () => {
    currentPage += 1;
    await loadImages();
  });

  async function loadImages() {
    try {
      showLoader(true);

      const data = await fetchImages(currentQuery, currentPage);
      showLoader(false);

      if (data.hits.length === 0) {
        showError('Sorry, there are no images matching your search query. Please try again!');
        return;
      }

      renderGallery(data.hits, currentPage > 1);
      totalHits = data.totalHits;

      if (currentPage * 40 < totalHits) {
        loadMoreBtn.style.display = 'block';
      } else {
        loadMoreBtn.style.display = 'none';
        showInfo("We're sorry, but you've reached the end of search results.");
      }

      setTimeout(smoothScrollAfterLoad, 500);
    } catch (error) {
      showLoader(false);
      showError('Something went wrong. Please try again!');
      console.error('Fetch error:', error);
    }
  }

  function resetGallery() {
    gallery.innerHTML = '';
    totalHits = 0;
    currentPage = 1;
    loadMoreBtn.style.display = 'none';
  }

  function showLoader(visible) {
    loader.style.display = visible ? 'block' : 'none';
  }

  function showError(message) {
    iziToast.error({ message, position: 'topRight' });
  }

  function showInfo(message) {
    iziToast.info({ message, position: 'topRight' });
  }

  function smoothScrollAfterLoad() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (galleryItems.length > 0) {
      const cardHeight = galleryItems[0].getBoundingClientRect().height;
      window.scrollBy({
        top: cardHeight * 2,
        left: 0,
        behavior: 'smooth',
      });
    }
  }
});