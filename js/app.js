var app = angular.module("myApp", ["ngRoute", "slickCarousel", '720kb.datepicker', 'ui-rangeSlider']);

// Customer ID
var filosID = '58d241886377390f246dc948'
    // API URL 
var API = 'http://my.twenty-one.co/api-v1/'
    // Destinations API
var destinationAPI = "http://128.199.46.240:8087/production/autocomplete_test.php?src=ONT&property_type=ACTIVITY&s="


/*
 * Menu Controller
 *
 */
app.controller('menuController', function($scope, $http) {

    $http.get(API + "destinations-include/" + filosID)
        .then(function(response) { $scope.destinations = response.data });
});

/*
 * Main Controller
 *
 */
app.controller('mainController', function($scope, $http) {
    $scope.accomodation = {}
    $scope.accomodation.rooms = []
    $scope.accomodation.rooms[0] = {}
    $scope.accomodation.rooms[0].adults = 2
    $scope.accomodation.rooms[0].children = 0
    $scope.accomodation.rooms[0].childrenAges = []
    $scope.accomodation.rooms[0].quantity = 1

    $scope.submitForm = function() {
        var location = $scope.generateLink($scope.accomodation)
        console.log($scope.accomodation)
        console.log(location)
        window.open(location)
    }

    $scope.generateLink = function(data) {
        var link = "http://bookings.holidaytours.gr/#/search/" +
            data.checkIn + "/" + data.checkOut + "/" + data.destination + "/" + data.destId + "/" +
            "(rooms:!((adults:" + data.rooms[0].adults + ",children:" + data.rooms[0].children +
            ",childrenAges:!(),quantity:1)),stars:(max:5,min:0))"

        return link
    }

    $scope.gennerateChildrenAgesArray = function(num) {
        $scope.accomodation.rooms[0].childrenAges = []
        for (i = 0; i < num; i++) {
            $scope.accomodation.rooms[0].childrenAges.push("")
        }
    }

    $scope.getDestinations = function(text) {
        $http.get(destinationAPI + text)
            .then(function(response) { $scope.choises = response.data });
    }

    $scope.choseDestinations = function(dest, destId) {
        $scope.choises = []
        $scope.accomodation.destination = dest
        $scope.accomodation.destId = destId
    }

    $http.get(API + "destinations/" + filosID)
        .then(function(response) { $scope.destinations = response.data });

    $http.get(API + "services/" + filosID)
        .then(function(response) { $scope.services = response.data });

    $http.get(API + "services-product-featured/" + filosID + '/Excursion')
        .then(function(response) { $scope.excursions = response.data });

    $http.get(API + "services-product-featured/" + filosID + '/Package')
        .then(function(response) { $scope.packages = response.data });

    // Slick settings
    $scope.slickConfig = {
        enabled: true,
        draggable: true,
        event: {
            beforeChange: function(event, slick, currentSlide, nextSlide) {},
            afterChange: function(event, slick, currentSlide, nextSlide) {}
        },
        responsive: [{
                breakpoint: 980,
                settings: { slidesToShow: 2, slidesToScroll: 2, infinite: true, dots: true }
            },
            { breakpoint: 600, settings: { slidesToShow: 2, slidesToScroll: 2 } },
            { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } }
        ]
    }
});



/*
 * Destination Info Controller
 *
 */
app.controller('destinationInfoController', function($scope, $http, $routeParams) {
    $scope.search = {}

    $http.get(API + "destination-one/" + $routeParams.destinationID)
        .then(function(response) {
            $scope.destination = response.data
            $scope.search.destination = $scope.destination.title
        });

    $http.get(API + "services-product-featured/" + filosID + '/Excursion')
        .then(function(response) { $scope.tours = response.data });

    $scope.slickConfig = {
        enabled: true,
        draggable: true,
        dots: true,

        autoplay: true,

        autoplaySpeed: 3000,
        event: {
            beforeChange: function(event, slick, currentSlide, nextSlide) {},
            afterChange: function(event, slick, currentSlide, nextSlide) {}
        },
        responsive: [{
                breakpoint: 980,
                settings: { slidesToShow: 2, slidesToScroll: 2, infinite: true, dots: true }
            },
            { breakpoint: 600, settings: { slidesToShow: 2, slidesToScroll: 2 } },
            { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } }
        ]
    }

});


/*
 * Service Info Controller
 *
 */
app.controller('serviceInfoController', function($scope, $http, $routeParams) {
    $scope.adults = new Array(8)
    $scope.children = new Array(8)
    $scope.childrenCount = []
    $scope.form = {}
    $scope.childrenAges = []

    $scope.getChildrenCount = function(count) {
        $scope.childrenCount = []
        for (i = 0; i < count; i++) {
            $scope.childrenCount.push(i)
        }
    }

    $http.get(API + "service-one/" + $routeParams.serviceID)
        .then(function(response) { $scope.service = response.data });

    $scope.book = function(form, service) {
        var childrenAges = $scope.makeChildrenAgesString($scope.childrenAges)

        if (!form.adults) form.adults = 2
        if (!form.children) form.children = 0

        URL = 'http://bookings.holidaytours.gr/#/activity/' + service.destinationOtagID + '/' + service.destination + '/2017-' + form.month + '-01' + '/2017-' + form.month + '-30/' + form.adults + '/' + form.children + '/' + childrenAges
        window.open(URL)
    }

    $scope.makeChildrenAgesString = function(childrenAges) {
        var agesString = ''
        $scope.childrenAges.forEach(function(age) {
            agesString = agesString + age + '~'
        })
        return agesString.slice(0, agesString.length - 1)
    }

});



/*
 * Services List Controller
 *
 */
app.controller('servicesListController', function($scope, $http, $routeParams, $timeout) {
    $scope.filters = {}
    $scope.filters.priceMin = 0;
    $scope.filters.priceMax = 0;
    $scope.priceMaxCap = 0;
    $scope.filtersOpen = true

    var width = window.innerWidth
    if (width < 992) $scope.filtersOpen = false

    function setMaxFilter(data) {
        for (i = 0; i < data.length; i++) {
            if (data[i].price > $scope.filters.priceMax) {
                $scope.filters.priceMax = data[i].price
                $scope.priceMaxCap = data[i].price
            }
        }
    }

    $http.get(API + "destinations/" + filosID)
        .then(function(response) {
            $scope.destinations = response.data
        });

    if (!$routeParams.destination || !$routeParams.category) {
        $http.get(API + "services-product/" + filosID + '/' + $routeParams.product)
            .then(function(response) {
                setMaxFilter(response.data)
                $scope.services = response.data
            });
    } else {
        var link = filosID + '/' + $routeParams.product + '/' + $routeParams.destination + '/' + $routeParams.category
        $http.get(API + "services-destination-category/" + link)
            .then(function(response) {
                setMaxFilter(response.data)
                $scope.services = response.data
            });
    }
});

/*
 * Offers Controller
 *
 */
app.controller('offersController', function($scope, $http, $routeParams, $window) {
    $scope.filters = {}
    $scope.filters.priceMin = 0;
    $scope.filters.priceMax = 0;
    $scope.priceMaxCap = 0;
    $scope.filtersOpen = true

    var width = window.innerWidth
    if (width < 767) $scope.filtersOpen = false

    $http.get(API + "services-offers/" + filosID)
        .then(function(response) {
            $scope.services = response.data
            setMaxFilter(response.data)
        });

    function setMaxFilter(data) {
        for (i = 0; i < data.length; i++) {
            if (data[i].price > $scope.filters.priceMax) {
                $scope.filters.priceMax = data[i].price
                $scope.priceMaxCap = data[i].price
            }
        }
    }
});



/*
 * Config and Routing
 *
 */
app.config(function($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "../../templates/main.html",
            controller: "mainController"
        })
        .when("/offers", {
            templateUrl: "../../templates/offers.html",
            controller: "offersController"
        })
        .when("/destination/:destinationID", {
            templateUrl: "../../templates/destination.html",
            controller: "destinationInfoController"
        })
        .when("/service/:serviceID", {
            templateUrl: "../../templates/service.html",
            controller: "serviceInfoController"
        })
        .when("/services/:product?/:destination?/:category?", {
            templateUrl: "../../templates/list-of-services.html",
            controller: "servicesListController"
        })
        .when("/about-us", {
            templateUrl: "../about-us.html"

        })
});

app.config(['$locationProvider', function($locationProvider) {
    $locationProvider.hashPrefix('');
}]);