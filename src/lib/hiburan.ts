export interface MovieItem {
	id: number;
	title: string;
	poster: string | null;
	backdrop: string | null;
	rating: number | null;
	voteCount: number | null;
	year: number | null;
	releaseDate: string | null;
	genres: string[];
	overview: string | null;
	status?: string | null;
	runtime?: number | null;
	sourceUrl: string;
}

export interface MovieCast {
	id: number;
	name: string;
	character: string | null;
	profile: string | null;
}

export interface MovieVideo {
	key: string;
	name: string;
	site: string;
	type: string;
	official: boolean;
}

export interface MovieDetail extends MovieItem {
	cast: MovieCast[];
	videos: MovieVideo[];
	similar: MovieItem[];
}

export interface MovieGenre {
	id: number;
	name: string;
}

export interface HiburanData {
	trendingDay: MovieItem[];
	trendingWeek: MovieItem[];
	popular: MovieItem[];
	nowPlaying: MovieItem[];
	upcoming: MovieItem[];
	genres: MovieGenre[];
	search: MovieItem[] | null;
	genreMovies: MovieItem[] | null;
	configured: boolean;
	message: string | null;
}
