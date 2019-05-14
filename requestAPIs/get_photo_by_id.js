const { sources } = require('./config')
const { unifyPhotoInterface } = require('./get_photos')
const { photos_cache } = require('./config')

module.exports = function getPhotoById(id, src_name) {

	let source_name = src_name.toLowerCase();

	let url = '';

	if (sources[source_name]) {
		if (source_name == 'unsplash')
			url = 'https://api.unsplash.com/photos/';
		else if (source_name == 'pexels')
			url = 'https://api.pexels.com/v1/photos/'
	}

	if (source_name == 'unsplash' || source_name == 'pexels') {
		return sources[source_name].request({
			url: url + id
		})
			.then(resp => {
				return unifyPhotoInterface(resp.data, source_name);
			})
	} else if (source_name == 'pixabay') {

		let photo = photos_cache[`${id}:${source_name}`];
		if (photo) {
			photo = unifyPhotoInterface(photo, source_name);
			return Promise.resolve(photo);
		}

		return Promise.resolve({
			author_link: '',
			author_name: '',
			source_link: '',
			source_name: '',
			main_image_link: ''
		});
	}

}