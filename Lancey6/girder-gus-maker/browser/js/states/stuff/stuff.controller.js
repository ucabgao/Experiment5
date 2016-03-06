app.controller('StuffCtrl', function($scope) {
    $scope.gusGifs = [];
    var rand;
    for(var i = 0; i < 500; i++) {
        $scope.gusGifs.push(i);
        rand = Math.floor(Math.random()*10)+1;
        $scope.gusGifs.push({
            rand: rand,
            value: i
        });
    }
    console.log($scope.gusGifs);
});