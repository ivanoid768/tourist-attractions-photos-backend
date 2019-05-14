const axios = require('axios');

const baseQuery = `tourist+attraction`;

module.exports.sources = {
	usplash: fromUnsplash(),
	pexels: fromPexels(),
	pixabay: fromPixabay()
}

module.exports.get_photos = getPhotos;

function fromUnsplash() {
	const access_key = '0f349dea9c68a0c54614aa914b044480402bb816fa0cc21820ab83dcaa371b40';
	const axi = axios.create({
		baseURL: 'https://api.unsplash.com/search/photos',
		// baseURL: 'http://localhost:5000/unsplash_tourist_attraction.json',
		params: {
			query: baseQuery, // 'tourist%20attraction'
			order_by: 'popular' // Added for consistancy because Pixabay returns photos ordered by popularity (but there is no info how ordered photos from Pexels)
		},
		headers: {
			common: {
				Authorization: 'Client-ID ' + access_key
			}
		}
	})

	// axi.photo_list_name = 'results';
	// // axi.photo_img_name = 'urls.thumb';
	// axi.photo_img_name = 'urls.small';
	// axi.total_photos = 'total';

	axi.source_name = 'unsplash';

	return axi;
}

function fromPexels() {
	const access_key = '563492ad6f9170000100000187d04447c7094a5c96e0dfd7119b3e7a';
	const axi = axios.create({
		baseURL: 'https://api.pexels.com/v1/search',
		// baseURL: 'http://localhost:5000/pexels_tourist_attraction.json',
		params: {
			query: `"tourist attraction"` // 'tourist%20attraction'
		},
		headers: {
			common: {
				Authorization: access_key
			}
		}
	})

	// axi.photo_list_name = 'photos';
	// axi.photo_img_name = 'src.tiny';
	// axi.total_photos = 'total_results';

	axi.source_name = 'pexels';

	return axi;
}

function fromPixabay() {
	const access_key = '11215352-991ab9a42a02be2db12b85705';

	const axi = axios.create({
		baseURL: 'https://pixabay.com/api/',
		// baseURL: 'http://localhost:5000/pixabay_tourist_attraction.json',
		params: {
			key: access_key,
			q: baseQuery, // 'tourist%20attraction'
			image_type: 'photo'
		}
	})

	// axi.photo_list_name = 'hits';
	// // axi.photo_img_name = 'previewURL';
	// axi.photo_img_name = 'webformatURL';
	// axi.total_photos = 'total';

	axi.source_name = 'pixabay';

	return axi;
}

function getPhotosFromSource(source, page = 1, per_page = 20, search = null) {

	let params = {
		page: page,
		per_page: per_page
	}

	if (search) {

		let s = search.replace(/\s+/gi, '+');
		if (source.source_name == 'pixabay') {
			params.q = s;
		} else {
			params.query = s;
		}

		if (source.source_name == 'pexels') {
			params.query = params.query.replace(/\+/ig, ' ')
		}

	}

	return source.request({
		params: params
	})
		.then(result => {
			//console.log(result);
			// total = result.data[source.total_photos];
			result.data.source_name = source.source_name;
			return result.data;
		})
	// .then(photos => {

	// 	photos.forEach(photo => {
	// 		setThumbnail(photo, source.photo_img_name)
	// 		unifyPhotoInterface(photo)
	// 	})

	// 	return { photos, total: parseInt(total) };
	// })
	// .catch(err => {
	// 	console.log('getPhoto:Error ', err)
	// 	return { photos: [], total: 0 }
	// })
}

function setThumbnail(photo, img_name) {

	let img_path = img_name.split('.');

	let thumb_img = img_path.reduce((prev, curr) => {
		return prev[curr];
	}, photo)

	photo.thumbnail_img = thumb_img

	return photo;
}

function unifyPhotoInterface(photo, source_name) {
	// let author_link
	// let author_name
	// let source_link
	// let source_name
	// let main_image_link

	if (photo.total_results)
		photo.total = photo.total_results;

	if (source_name == 'pexels') {
		photo.author_link = photo.photographer_url;
		photo.author_name = photo.photographer;
		photo.source_link = photo.url;
		photo.main_image_link = photo.src.large2x;
	}
	else if (source_name == 'pixabay') {
		photo.author_link = 'https://pixabay.com/en/users/' + photo.user_id;
		photo.author_name = photo.user;
		photo.source_link = photo.pageURL; // str2.match(/\/([^/]+)(?:\/)$/i)[1]
		photo.main_image_link = photo.largeImageURL;
	}
	else if (source_name == 'unsplash') {
		photo.author_link = photo.user.links.html;
		photo.author_name = photo.user.name;
		photo.source_link = photo.links.html; //  str.match(/photos\/(.+)(?:\/|)$/i)[1]
		photo.main_image_link = photo.urls.regular;
	}

	let src_name = '';
	if (source_name == 'unsplash' || source_name == 'pexels') {
		src_name = source_name;
	} else {
		src_name = photo.source_link.match(/http(?:s|):\/\/(?:www.|)([a-zA-Z]+).com/i)[1];
	}

	photo.source_name = src_name.replace(src_name.charAt(0), src_name.charAt(0).toUpperCase());

	return photo;

}

function getPhotos(page = 1, per_page = 20, search = null) {

	return Promise.all([
		getPhotosFromSource(fromUnsplash(), page, per_page, search),
		getPhotosFromSource(fromPexels(), page, per_page, search),
		getPhotosFromSource(fromPixabay(), page, per_page, search)
	])
		.then(dataArr => {
			return composePhotos(dataArr, per_page)
		})


}

function composePhotos(dataArr, per_page) {

	const total = getTotal(dataArr);

	let photos = [];

	for (let i = 0; i < per_page; i++) {

		dataArr.forEach(data => {
			let source = data.source_name;
			let source_photos;
			// console.log(source, data)

			if (source == 'unsplash')
				source_photos = data.results;
			else if (source == 'pixabay')
				source_photos = data.hits;
			else if (source == 'pexels')
				source_photos = data.photos;

			if (source_photos[i]) {
				let photo = unifyListPhotoInterface(source_photos[i], source)
				if (photo)
					photos.push(photo);
			}

		})

	}

	return { photos: photos, total: total }

}

function getTotal(dataArr) {

	let total_arr = [];

	dataArr.forEach(data => {
		const source = data.source_name;
		if (source == 'pexels')
			total_arr.push(data.total_results)
		else
			total_arr.push(parseInt(data.total))

	})

	return total_arr.reduce((sum, total) => sum + total, 0);
}

function unifyListPhotoInterface(source_photo, source) {
	// console.log(source_photo, source)
	let photo = new Object(null);

	if (source == 'unsplash') {
		photo.id = source_photo.id;
		photo.name = source_photo.alt_description || source_photo.description;
		photo.thumbnail = source_photo.urls.small;
	}
	else if (source == 'pixabay') {
		photo.id = source_photo.id;
		photo.name = source_photo.tags.replace(/,/ig, '');
		photo.thumbnail = source_photo.webformatURL;
	}
	else if (source == 'pexels') {
		photo.id = source_photo.id;
		photo.name = source_photo.url.match(/photo\/([\w-]+)-\d+/i)[1].replace(/-/ig, ' ');
		photo.thumbnail = source_photo.src.tiny;
	}

	if (photo.name)
		photo.name = photo.name.charAt(0).toUpperCase() + photo.name.slice(1);

	photo.source = source;

	return photo.thumbnail ? photo : null;
}

module.exports.ax_usplash = fromUnsplash();
module.exports.ax_pexels = fromPexels();
module.exports.ax_pixabay = fromPixabay();

module.exports.unifyPhotoInterface = unifyPhotoInterface;