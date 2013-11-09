// client/client.js

Deps.autorun(function(){
	Meteor.subscribe("activities-others");
	// should be team-reports and personal-reports individually
	Meteor.subscribe("reports");	
	Meteor.subscribe("userData");
});


Scrumban.log_action = function(state) {
	//might fail if not logged in on Meteor.user().services.google.id
	// or undefined state
	try {	
		check(state, String);
		var insert_id = Session.get('insert_id');
		Meteor.call("log_action", state, Meteor.userId(), function(error, insert_id) {
			if(insert_id === null) {
				state = undefined;
			}
			Session.set('current_state', state);
			Session.set('insert_id', insert_id);
		});
	} catch(e) {
	}
}

Meteor.startup(function() {
	Meteor.call("get_sprint_report", function(error, report) {
		Session.set('serverDataResponse',  report);
	});	
});

Template.main.events({
	'click #logout': function (e, template) {
		Meteor.logout();
	},
	'click #controls > button': function (e, template) {
		var state = e.currentTarget.id;
		Scrumban.log_action(state);		
	}    
});

Mousetrap.bind(['1', '2', '3'], function(e, key) {
	var state;
	switch(key) {
		case '1':
			state = 'green';
			break;
		case '2':
			state = 'yellow';
			break;
		case '3':
			state = 'red';
			break;			
	}
	Scrumban.log_action(state);
});

Template.admin.events({
	'click .admin-delete > button': function (e, template) {
		var type = e.srcElement.id;
		Meteor.call("admin_delete", type, function(error) {
			console.log(type+' deleted!');
			Session.set('current_state', undefined);
		});	
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
    	return Meteor.user().services.google.id;
    },
    activities_red: function() {
    	return Activities.find({state: 'red'}).fetch();
    },
    sprint_report: function() {
	    return Session.get('serverDataResponse') || "";
    }
});

Template.activities.helpers({
    activities: function() {
    	var activities =  Activities.find({}, {sort: {created_at: -1}, limit: 4}).fetch();
    	_.map(activities || [], function(activity) {
    		return activity.created_at = moment(activity.created_at).fromNow();
    	});
    	return activities;
    }
});



Template.report.helpers({
	// no sharing/inheritance, copied from main.helpers
    identifier: function () { 
    	return this.userId;
    },
    team: function() {
		return Scrumban.get_report();
 	},
 	personal: function() {
 		try {
 			return Scrumban.get_report(this.userId);
		} catch(e) {
		}
 	}     	     
});

Handlebars.registerHelper('progress_on', function(state) {
	if(state == Session.get('current_state')) {
		return 'progress-striped';
	}
});

Handlebars.registerHelper('class_for', function(state) {
	var obj = _.find(Scrumban.states, function(s){ return state == s.name; });
	return obj.lbl_class;
});