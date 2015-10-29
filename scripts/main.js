'use strict';

const myApp = angular.module('myApp', [])
.controller('mainController', ['$scope', 'movieSvc', function ($scope, movieSvc) {
	$scope.users = {
		online: [
			{
				name: 'Victor Erixon',
				subject: 'The Great Gatsby'
			},
			{
				name: 'Gustav Butlex',
				subject: 'Wolverine'
			},
			{
				name: 'Malte Jansson',
				subject: 'Smurfs'
			},
			{
				name: 'August Berglund',
				subject: 'Californication'
			},
			{
				name: 'Alicia Agneson',
				subject: 'Swan Lake'
			},
		],
		offline: [
			{
				name: 'Bill S Kenney',
				subject: 'Jobs'
			},
			{
				name: 'Charlie Waite',
				subject: 'The Great Gatsby'
			},
			{
				name: 'Justin Pervorse',
				subject: 'Pacific Rim'
			},
			{
				name: 'Trent Walton',
				subject: 'Planes'
			},
			{
				name: 'Rogie King',
				subject: '2 Guns'
			},
		]
	};

	$scope.allMovies = null;

	//on page load, call out to IMDB to get movie info
	$scope.init = function () {
		movieSvc.retrieveAllInfo().then(
			(movies) => {
				$scope.$apply(() => {
					$scope.allMovies = movies;
				});
			},
			(err) => {
				$scope.$apply(() => {
					$scope.movieError = "Error occured loading movies.";
				});
			}
		);
	};
	$scope.init();
}])
.service('movieSvc', ['$http', function ($http) {
	const allMovies = ['The Great Gatsby', '2 Guns', 'The Lone Ranger', 'The Godfather', 'Black Mass',
	'World War Z', 'The Spectacular Now', 'Pacific Rim', 'The Matrix', 'Planes', 'Kick-Ass'];

	const omdbURL = 'http://www.omdbapi.com/?callback=JSON_CALLBACK&plot=short&r=json&t=';

	this.retrieveAllInfo = function () {
		return new Promise( (resolve, reject) => {		//return promise
			//create promises for all movies
			let promiseArr = [];
			allMovies.forEach( (movie) => {
				promiseArr.push(this.createMoviePromise(movie));
			});

			//asynchronously grab all movie info
			Promise.all(promiseArr).then( 
				(movies) => {
					//pluck the data
					const allMovieData = _.pluck(movies, 'data');
					resolve(allMovieData);
				},
				(err) => {
					console.log(`Error retreiving movie info: ${err}`);
					reject(err)
				}
			);
		});
	}
	this.createMoviePromise = function (title) {
		const fullMovieURL = (omdbURL + title);
		const httpPromise = $http.jsonp(fullMovieURL);

		return httpPromise;
	}

}])
.directive('fullPage', function($compile) {

	function link(scope, element, attrs) {
	    

  	}

	return {
		restrict:'A',
		link
	}
});
