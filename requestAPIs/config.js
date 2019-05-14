const axios = require('axios')

module.exports.sources = {
	unsplash: fromUnsplash(),
	pexels: fromPexels()
}

function fromUnsplash() {
	const access_key = '0f349dea9c68a0c54614aa914b044480402bb816fa0cc21820ab83dcaa371b40';
	const axi = axios.create({
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
			q: 'tourist%20attraction',
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