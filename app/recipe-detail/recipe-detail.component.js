angular.module('recipeDetail').component('recipeDetail', {
    templateUrl: 'recipe-detail/recipe-detail.template.html',
    controller: ['$http', '$routeParams',
        function RecipeDetailController($http, $routeParams) {
            var self = this;

            self.setImage = function setImage(imageUrl) {
                self.mainImageUrl = imageUrl;
            };

            $http.get('data/' + $routeParams.recipeId + '.json').then(function (response) {
                self.recipe = response.data;
                self.setImage(self.recipe.images[0]);
            });
        }
    ]
});