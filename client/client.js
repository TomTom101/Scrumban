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
		
		Meteor.call("log_action", insert_id, state, identifier, function(error, insert_id) {
			Session.set('current_state', state);
			Session.set('insert_id', insert_id);
		});
	},
	'change #identifier': function (e, template) {
		Session.set('identifier', document.getElementById('identifier').value);
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
		console.log('team');
		return Scrumban.get_report();
 	},
 	personal: function() {
	 	console.log('personal');
		return Scrumban.get_report(Session.get('identifier'));
 	}     	     
});