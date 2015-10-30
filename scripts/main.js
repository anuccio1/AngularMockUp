'use strict';

const myApp = angular.module('myApp', [])
.controller('mainController', ['$scope', 'movieSvc', function ($scope, movieSvc) {

	//start scope variables
	$scope.users = movieSvc.getUsers();	//get mock users from service
	$scope.usersDisplay = $scope.users;

	$scope.allMovies = null;	//list of all movies, does not change
	$scope.allMoviesDisplay = null;	//all movies being shown on screen

	$scope.movieShowing = null;
	$scope.detailOnLeft = false;
	$scope.showByRelease = null;	//for ng-class
	$scope.movieSearch = '';	//movie search input
	$scope.chatWith = '';	//users search
	$scope.selectedMenuItem = 'Discover';
	$scope.selectedUser = null;
	$scope.allChats = {};

	//end scope variables

	$scope.getOnlineUsers = function () {
		const onlineUsers = $scope.usersDisplay.filter( (user) => {
			return user.online;
		});
		return onlineUsers;
	};

	$scope.getOfflineUsers = function () {
		const offlineUsers = $scope.usersDisplay.filter( (user) => {
			return !user.online;
		});
		return offlineUsers;
	};

	$scope.filterUsers = function () {
		$scope.usersDisplay = $scope.users.filter((user) => {
			const currUser = user.name.toLowerCase();
			return currUser.indexOf($scope.chatWith.toLowerCase()) >= 0;
		});
		$scope.chatWith = '';
	};

	$scope.filterMovies = function () {
		$scope.refreshMovies();
		$scope.allMoviesDisplay = $scope.allMovies.filter((movie) => {
			const title = movie.Title.toLowerCase();
			return title.indexOf($scope.movieSearch.toLowerCase()) >= 0;
		});
		$scope.movieSearch = '';
	};

	//sort methods
	$scope.showByReleaseDate = function (fromMenu) {
		if (fromMenu) {
			$scope.refreshMovies();
			$scope.selectedMenuItem = 'New Releases';
		}
		$scope.allMoviesDisplay = $scope.allMoviesDisplay.sort((a, b) => {
			const aDate = new Date(a.Released);
			const bDate = new Date(b.Released);

			return bDate - aDate;
		});
		if (fromMenu) {		//clicked on side, show top 7
			$scope.allMoviesDisplay = $scope.allMoviesDisplay.slice(0,7);
		} else {
			$scope.showByRelease = true;
		}
	};

	$scope.showByPopularity = function (fromMenu) {
		if (fromMenu) {
			$scope.refreshMovies();
			$scope.selectedMenuItem = 'Top Charts';
		}
		$scope.allMoviesDisplay = $scope.allMoviesDisplay.sort((a, b) => {
			return b.imdbRating - a.imdbRating;
		});
		if (fromMenu) {		//clicked on side, show top 7
			$scope.allMoviesDisplay = $scope.allMoviesDisplay.slice(0,7);
		} else {
			$scope.showByRelease = false;
		}
	};
	//end sort methods

	$scope.showMovieDetails = function (title) {
		$scope.movieShowing = title;
		const currMovieDetails = _.filter($scope.allMovies, (movie) => movie.Title === title);
		const currMovie = $('#movie_' + currMovieDetails[0].imdbID);

		//make sure the detail view opens to the right, unless there is no room in the view
		const parentWidth = currMovie.parent().width();
		const pos = currMovie.position();
		const leftPos = pos.left;

		const detail = $('.movie-long-detail');
		const detailWidth = detail.width();
		const extraPadding = 150;	//margin + width estimate

		$scope.detailOnLeft = (parentWidth - leftPos - extraPadding <= detailWidth); //for ng-class to make the detail view go to the right
	};
	$scope.hideMovieDetails = function () {
		$scope.movieShowing = null;
	};
	$scope.isMovieShowing = function (title) {
		return $scope.movieShowing && $scope.movieShowing === title;
	};

	$scope.refreshMovies = function () {
		$scope.allMoviesDisplay = $scope.allMovies;
		$scope.selectedMenuItem = 'Discover';
		$scope.showByRelease = null;
	};

	$scope.openChatWithUser = function (userName) {
		$scope.selectedUser = userName;
	};

	$scope.addMessageToConvo = function () {
		if (!$scope.allChats[$scope.selectedUser]) {
			$scope.allChats[$scope.selectedUser] = [];	//create array of message indexed by user
		}
		$scope.allChats[$scope.selectedUser].push($scope.currentMessage);
		$scope.currentMessage = '';
	}

	//on page load, call out to IMDB to get movie info
	$scope.init = function () {
		movieSvc.retrieveAllInfo().then(
			(movies) => {
				$scope.$apply(() => {
					$scope.allMovies = movies;
					$scope.refreshMovies();
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
	'World War Z', 'The Spectacular Now', 'Pacific Rim', 'The Matrix', 'Planes', 'Kick-Ass', 'Citizen Kane',
	'Mulholland Drive', 'The Shining', 'Full Metal Jacket', 'Batman Begins', 'Sicario', 'Friday', 'The Dark Knight',
	'12 Angry Men', 'Inception', 'Forrest Gump', 'Fight Club', 'Goodfellas', 'The Martian', 'Steve Jobs'];

	const mockUsers = [
		{
			name: 'Victor Erixon',
			subject: 'The Great Gatsby',
			online: true
		},
		{
			name: 'Gustav Butlex',
			subject: 'Wolverine',
			online: true
		},
		{
			name: 'Malte Jansson',
			subject: 'Smurfs',
			online: true
		},
		{
			name: 'August Berglund',
			subject: 'Californication',
			online: true
		},
		{
			name: 'Alicia Agneson',
			subject: 'Swan Lake',
			online: true
		},
		{
			name: 'Bill S Kenney',
			subject: 'Jobs',
			online: false
		},
		{
			name: 'Charlie Waite',
			subject: 'The Great Gatsby',
			online: false
		},
		{
			name: 'Justin Pervorse',
			subject: 'Pacific Rim',
			online: false
		},
		{
			name: 'Trent Walton',
			subject: 'Planes',
			online: false
		},
		{
			name: 'Rogie King',
			subject: '2 Guns',
			online: false
		}
	];

	const omdbURL = 'http://www.omdbapi.com/?callback=JSON_CALLBACK&plot=short&r=json&t=';

	//this uses the OMDB API: http://omdbapi.com/ (open source)
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

	this.getUsers = function () {
		return mockUsers;
	}

}])
//for pressing enter on inputs
.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if(event.which === 13) {
                scope.$apply(function(){
                    scope.$eval(attrs.ngEnter);
                });
                
                event.preventDefault();
            }
        });
    };
});
