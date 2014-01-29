Package.describe({
    summary: "Load bootstrap script."
});

Package.on_use(function(api) {
    api.add_files(['../../public/bower_components/bootstrap/dist/css/bootstrap.min.css'], 'client');
    api.add_files(['../../public/bower_components/bootstrap/dist/css/bootstrap-theme.css'], 'client');
    api.add_files(['../../public/bower_components/bootstrap/dist/js/bootstrap.min.js'], 'client');

});