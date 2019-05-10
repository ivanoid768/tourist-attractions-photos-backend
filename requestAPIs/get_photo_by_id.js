import axi from './get_photos'
import { unifyPhotoInterface } from './get_photos'

export default function getPhotoById(id, source_name) {

	let s_name = source_name.toLowerCase();

	let s_m = {
		unsplash: {
			source: 'usplash',
			url: 'https://api.unsplash.com/photos/'
		},
		pexels: {
			source: 'pexels',
			url: 'https://api.pexels.com/v1/photos/'
		}
	}

	if (s_name == 'unsplash' || s_name == 'pexels') {
		return axi[s_m[s_name].source].request({
			url: s_m[s_name].url + id
		})
			.then(resp => {
				// console.log('unsplash: ', resp.data);
				return unifyPhotoInterface(resp.data);
			})
	} else if (s_name == 'pixabay') {
		return Promise.resolve(false);
	}

}