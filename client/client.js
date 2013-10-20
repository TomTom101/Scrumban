// client/client.js

Deps.autorun(function(){
	Meteor.subscribe("messages");
	Meteor.subscribe("report");
});

Template.main.events({
	'click #controls > button': function (e, template) {
		var state = e.currentTarget.id;
		var identifier = Session.get('identifier');
		var insert_id = Session.get('insert_id');
		
		Meteor.call("log_action", state, insert_id, identifier, function(error, insert_id) {
			if(insert_id === null) {
				state = undefined;
			}
			Session.set('current_state', state);
			Session.set('insert_id', insert_id);
		});
	},
	'change #identifier': function (e, template) {
		Session.set('identifier', document.getElementById('identifier').value);
		console.log('Indentifier changed to ' + Session.get('identifier'));
	}
    
});


Template.main.helpers({
    states: function() {
    	return Scrumban.states;
    },
    current_state: function () { 
    	return Session.get('current_state');
    },
    identifier: function () { 
    	return Session.get('identifier');
    }
});

Template.messages.helpers({
    messages: function() {
    	return Messages.find({}, {sort: {created_at: -1}, limit: 4}).fetch();
    }  
});



Template.report.helpers({
	// no sharing/inheritance, copied from main.helpers
    identifier: function () { 
    	return Session.get('identifier');
    },
    team: function() {
		return Scrumban.get_report();
 	},
 	personal: function() {
		return Scrumban.get_report(Session.get('identifier'));
 	}     	     
});

Handlebars.registerHelper('progress_on', function(state) {
	if(state == Session.get('current_state')) {
		return 'progress-striped';
	}
});