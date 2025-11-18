// app.js – works with the Firebase setup we already added in each page
function loadGallery(category = null, containerId = 'gallery', limit = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '<p class="text-center py-5">Loading photos...</p>';

  let q = firebase.db.collection('photos').orderBy('createdAt', 'desc');
  if (category) q = q.where('category', '==', category);
  if (limit) q = q.limit(limit);

  q.get().then(snap => {
    container.innerHTML = '';
    if (snap.empty) {
      container.innerHTML = '<p class="text-center py-5">No photos yet – <a href="admin.html">log in and add some!</a></p>';
      return;
    }
    snap.forEach(doc => {
      const d = doc.data();
      const div = document.createElement('div');
      div.className = 'col-lg-4 col-md-6 mb-4';
      div.innerHTML = `
        <a href="${d.url}" class="glightbox" data-gallery="${category || 'all'}">
          <img src="${d.url}" class="img-fluid rounded shadow" loading="lazy" style="height:350px;object-fit:cover;width:100%">
        </a>`;
      container.appendChild(div);
    });
    GLightbox({ selector: '.glightbox' });
  });
}

function loadAllGalleries() {
  const tabList = document.getElementById('tabList');
  const tabContent = document.getElementById('tabContent');
  if (!tabList || !tabContent) return;

  firebase.db.collection('photos').get().then(snap => {
    const categories = new Set();
    snap.forEach(doc => categories.add(doc.data().category));

    tabList.innerHTML = '';
    tabContent.innerHTML = '';

    if (categories.size === 0) {
      tabContent.innerHTML = '<div class="p-5 text-center">No galleries yet – <a href="admin.html">upload photos first</a></div>';
      return;
    }

    [...categories].sort().forEach((cat, i) => {
      const nice = cat.charAt(0).toUpperCase() + cat.slice(1);
      tabList.innerHTML += `
        <li class="nav-item">
          <a class="nav-link ${i===0?'active':''}" data-bs-toggle="tab" href="#tab-${cat}">${nice}</a>
        </li>`;
      tabContent.innerHTML += `
        <div class="tab-pane fade ${i===0?'show active':''}" id="tab-${cat}">
          <h2 class="mt-4">${nice}</h2>
          <div class="row" id="gallery-${cat}"></div>
        </div>`;
      loadGallery(cat, `gallery-${cat}`);
    });
  });
}
