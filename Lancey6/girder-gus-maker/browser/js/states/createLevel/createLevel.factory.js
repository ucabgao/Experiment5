app.factory('CreateLevelFactory', function ($http) {
	var factory = {};
	factory.submitLevel = function(objArr, title, girderCount, skyColor, isPublished, id) {
		try { 
			var map = {
				startGirders: girderCount,
objects: objArr,
skyColor: skyColor
			}
			var level = {
				title: title,
map: map,
published: isPublished || false
			}
			if(!id || isPublished) return $http.post('/api/levels/', level).then(res => res.data); 
			else return $http.put('/api/levels/'+id, level).then(res => res.data);
		} catch(e) {
			console.error(e);
		}
	};
	return factory;
});
